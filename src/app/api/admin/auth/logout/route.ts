import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createSupabaseServerAppClient } from "@/lib/supabase";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerAppClient({
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    });

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin logout failed", error);
    return NextResponse.json(
      { error: "Çıkış yapılırken beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}
