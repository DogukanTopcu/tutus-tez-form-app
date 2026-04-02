import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerAppClient } from "@/lib/supabase";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const cookieStore = await cookies();
    const supabase = createSupabaseServerAppClient({
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    });

    const { error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Giriş başarısız. E-posta veya şifreyi kontrol edin." },
        { status: 400 },
      );
    }

    const access = await getAuthenticatedAdminUser();
    if (access.status !== "ok") {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Bu kullanıcı admin panel erişimine sahip değil." },
        { status: 403 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz giriş verisi." }, { status: 400 });
    }

    console.error("Admin login failed", error);
    return NextResponse.json(
      { error: "Giriş sırasında beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}
