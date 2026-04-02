import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase";
import { buildSubmissionInsert, getPublishedSurveyVersion } from "@/lib/survey-store";

const submissionSchema = z.object({
  surveyVersionId: z.string().optional(),
  responses: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export async function POST(request: Request) {
  try {
    const body = submissionSchema.parse(await request.json());
    const publishedVersion = await getPublishedSurveyVersion();

    if (body.surveyVersionId && body.surveyVersionId !== publishedVersion.id) {
      return NextResponse.json(
        {
          error:
            "Form bu sırada güncellendi. Lütfen sayfayı yenileyip en son sürüm ile yeniden deneyin.",
        },
        { status: 409 },
      );
    }

    const { insert, profile } = buildSubmissionInsert(publishedVersion, body.responses);

    if (!profile.consent) {
      return NextResponse.json(
        {
          error:
            "Yanıtlar yalnızca anonim araştırma kullanımına onay verilirse kaydedilebilir.",
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("survey_responses")
      .insert(insert)
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert failed", error);
      return NextResponse.json(
        {
          error:
            "Yanıtlar kaydedilirken bir sorun oluştu. Lütfen daha sonra yeniden deneyin.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Gönderilen veri biçimi geçerli değil." },
        { status: 400 },
      );
    }

    console.error("Submission route failed", error);
    return NextResponse.json(
      {
        error:
          "Sunucu tarafında beklenmeyen bir hata oluştu. Lütfen daha sonra yeniden deneyin.",
      },
      { status: 500 },
    );
  }
}
