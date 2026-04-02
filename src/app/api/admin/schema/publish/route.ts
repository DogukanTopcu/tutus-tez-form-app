import { NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-api";
import { publishDraftSurveyVersion } from "@/lib/survey-store";

export async function POST() {
  const authorization = await authorizeAdminRequest();
  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    const published = await publishDraftSurveyVersion(authorization.access.user.id);
    return NextResponse.json({ ok: true, published });
  } catch (error) {
    console.error("Publish survey version failed", error);
    return NextResponse.json(
      { error: "Taslak yayınlanırken beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}
