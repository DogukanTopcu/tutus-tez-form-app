import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type CookieBag = {
  getAll: () => { name: string; value: string }[];
  setAll?: (cookies: Array<{ name: string; value: string; options: CookieOptions }>) => void;
};

const getEnv = (name: string, fallbackName?: string) => {
  const value = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}${fallbackName ? ` or ${fallbackName}` : ""}`);
  }
  return value;
};

export const getSupabaseUrl = () => getEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");

export const getSupabaseAnonKey = () =>
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY");

export const getSupabaseServiceRoleKey = () => getEnv("SUPABASE_SERVICE_ROLE_KEY");

export const getSupabaseAdminClient = () => {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const createSupabaseBrowserClient = () =>
  createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());

export const createSupabaseServerAppClient = (cookies: CookieBag) =>
  createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies,
  });
