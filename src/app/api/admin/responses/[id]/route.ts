import { NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-api";
import { getAdminResponseDetail, softDeleteResponse } from "@/lib/survey-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeAdminRequest();
  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    const { id } = await context.params;
    const response = await getAdminResponseDetail(id);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Admin response detail GET failed", error);
    return NextResponse.json(
      { error: "Yanıt detayı yüklenirken beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeAdminRequest();
  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    const { id } = await context.params;
    await softDeleteResponse(id, authorization.access.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin response DELETE failed", error);
    return NextResponse.json(
      { error: "Yanıt silinirken beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}
