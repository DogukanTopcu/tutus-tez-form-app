import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAuthenticatedAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const access = await getAuthenticatedAdminUser();
  if (access.status === "ok") {
    redirect("/admin/responses");
  }

  return (
    <main className="admin-login">
      <section className="admin-login__card">
        <div className="admin-login__header">
          <p className="section-eyebrow">Admin Login</p>
          <h1>Yönetici paneline giriş</h1>
          <p>
            Supabase Auth email/password ile giriş yapın. `admin_users` boşsa ilk giriş yapan
            kullanıcı owner olarak kaydedilir.
          </p>
        </div>
        <AdminLoginForm />
      </section>
    </main>
  );
}
