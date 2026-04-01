import { NextResponse } from "next/server";
import { z } from "zod";

import {
  calculateBodyMassIndex,
  calculatePsqiScore,
  calculateUltraProcessedCount,
  getNumberValue,
  getTextValue,
  type SurveyResponses,
} from "@/lib/survey";
import { getSupabaseAdminClient } from "@/lib/supabase";

const submissionSchema = z.object({
  responses: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

const buildProfile = (responses: SurveyResponses) => {
  const age = getNumberValue(responses, "age");
  const heightCm = getNumberValue(responses, "height_cm");
  const weightKg = getNumberValue(responses, "weight_kg");

  return {
    participantCode: getTextValue(responses, "participant_code") || null,
    age,
    gender: getTextValue(responses, "gender") || null,
    genderOther: getTextValue(responses, "gender_other") || null,
    role: getTextValue(responses, "role") || null,
    nationality: getTextValue(responses, "nationality") || null,
    shiftType: getTextValue(responses, "shift_type") || null,
    seaServiceYears: getNumberValue(responses, "sea_service_years"),
    seaServiceMonths: getNumberValue(responses, "sea_service_months"),
    daysWithoutShore: getNumberValue(responses, "days_without_shore"),
    heightCm,
    weightKg,
    consent: getTextValue(responses, "consent") === "yes",
    bmi: calculateBodyMassIndex(heightCm, weightKg),
  };
};

export async function POST(request: Request) {
  try {
    const body = submissionSchema.parse(await request.json());
    const responses = body.responses;
    const profile = buildProfile(responses);

    if (!profile.consent) {
      return NextResponse.json(
        {
          error:
            "Yanıtlar yalnızca anonim araştırma kullanımına onay verilirse kaydedilebilir.",
        },
        { status: 400 },
      );
    }

    const psqiScore = calculatePsqiScore(responses);
    const ultraProcessedYesCount = calculateUltraProcessedCount(responses);
    const stoolType = getNumberValue(responses, "bristol_stool_type");

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("survey_responses")
      .insert({
        age: profile.age,
        gender: profile.gender,
        nationality: profile.nationality,
        role: profile.role,
        shift_type: profile.shiftType,
        height_cm: profile.heightCm,
        weight_kg: profile.weightKg,
        bmi: profile.bmi,
        stool_type: stoolType,
        psqi_score: psqiScore,
        ultra_processed_yes_count: ultraProcessedYesCount,
        consent_confirmed: true,
        profile,
        analytics: {
          psqiScore,
          ultraProcessedYesCount,
          stoolType,
        },
        responses,
        source: "public-web",
      })
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
