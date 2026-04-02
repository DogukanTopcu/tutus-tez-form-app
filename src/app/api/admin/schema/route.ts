import { NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-api";
import { getOrCreateDraftSurveyVersion, getPublishedSurveyVersion, getSurveyVersionMetas, saveDraftSurveySchema } from "@/lib/survey-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const authorization = await authorizeAdminRequest();
  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    const [draft, published, versions] = await Promise.all([
      getOrCreateDraftSurveyVersion(authorization.access.user.id),
      getPublishedSurveyVersion(),
      getSurveyVersionMetas(),
    ]);

    return NextResponse.json({
      draft,
      published,
      versions,
    });
  } catch (error) {
    console.error("Admin schema GET failed", error);
    return NextResponse.json(
      { error: "Form şeması yüklenirken beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const authorization = await authorizeAdminRequest();
  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    const body = (await request.json()) as { schema?: unknown };
    if (!body || typeof body !== "object" || !body.schema || typeof body.schema !== "object") {
      return NextResponse.json({ error: "Geçersiz schema payload." }, { status: 400 });
    }

    const draft = await saveDraftSurveySchema(body.schema as any, authorization.access.user.id);

    return NextResponse.json({ ok: true, draft });
  } catch (error) {
    console.error("Admin schema PUT failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Taslak kaydedilirken hata oluştu.",
      },
      { status: 400 },
    );
  }
}
