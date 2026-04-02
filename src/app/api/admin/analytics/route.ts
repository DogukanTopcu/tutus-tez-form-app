import { NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-api";
import { getAnalyticsPayload } from "@/lib/survey-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeAdminRequest();
  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const analytics = await getAnalyticsPayload({
      versionId: searchParams.get("versionId"),
      gender: searchParams.get("gender"),
      role: searchParams.get("role"),
      shiftType: searchParams.get("shiftType"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
    });

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Admin analytics GET failed", error);
    return NextResponse.json(
      { error: "Analitik verisi yüklenirken beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}
