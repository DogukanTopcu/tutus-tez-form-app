import { NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-api";
import { listAdminResponses } from "@/lib/survey-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeAdminRequest();
  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const responses = await listAdminResponses({
      versionId: searchParams.get("versionId"),
      gender: searchParams.get("gender"),
      role: searchParams.get("role"),
      shiftType: searchParams.get("shiftType"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
    });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Admin responses GET failed", error);
    return NextResponse.json(
      { error: "Yanıt listesi yüklenirken beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}
