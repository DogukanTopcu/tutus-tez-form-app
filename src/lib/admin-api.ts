import "server-only";

import { NextResponse } from "next/server";

import { getAuthenticatedAdminUser } from "@/lib/admin-auth";

export const authorizeAdminRequest = async () => {
  const access = await getAuthenticatedAdminUser();

  if (access.status === "unauthenticated") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (access.status === "forbidden") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const, access };
};
