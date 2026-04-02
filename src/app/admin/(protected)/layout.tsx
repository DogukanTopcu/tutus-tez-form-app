import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPageAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await requireAdminPageAccess();

  return (
    <AdminShell admin={access.admin} email={access.user.email ?? access.admin.email}>
      {children}
    </AdminShell>
  );
}
