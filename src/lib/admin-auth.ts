import "server-only";

import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerAppClient, getSupabaseAdminClient } from "@/lib/supabase";

export type AdminUserRecord = {
  user_id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
};

export type AdminAccessResult =
  | { status: "unauthenticated" }
  | { status: "forbidden"; user: User }
  | { status: "ok"; user: User; admin: AdminUserRecord };

export const getSupabaseSessionClient = async () => {
  const cookieStore = await cookies();

  return createSupabaseServerAppClient({
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      } catch {
        // Server components may not mutate cookies; route handlers and middleware can.
      }
    },
  });
};

const ensureFirstAdminUser = async (user: User) => {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("admin_users")
    .select("user_id", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  if ((count ?? 0) > 0) {
    return null;
  }

  const record = {
    user_id: user.id,
    email: user.email ?? "",
    display_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "Owner",
    role: "owner",
  };

  const { data, error: insertError } = await supabase
    .from("admin_users")
    .insert(record)
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return data as AdminUserRecord;
};

export const getAuthenticatedAdminUser = async (): Promise<AdminAccessResult> => {
  const sessionClient = await getSupabaseSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return { status: "ok", user, admin: data as AdminUserRecord };
  }

  const bootstrapped = await ensureFirstAdminUser(user);
  if (bootstrapped) {
    return { status: "ok", user, admin: bootstrapped };
  }

  return { status: "forbidden", user };
};

export const requireAdminPageAccess = async () => {
  const result = await getAuthenticatedAdminUser();

  if (result.status === "unauthenticated") {
    redirect("/admin/login");
  }

  if (result.status === "forbidden") {
    redirect("/admin/login?error=forbidden");
  }

  return result;
};
