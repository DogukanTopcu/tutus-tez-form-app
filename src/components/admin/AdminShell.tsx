"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import type { AdminUserRecord } from "@/lib/admin-auth";

type AdminShellProps = {
  admin: AdminUserRecord;
  email: string;
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { href: "/admin/form", label: "Form" },
  { href: "/admin/responses", label: "Yanıtlar" },
  { href: "/admin/analytics", label: "Analitik" },
];

export function AdminShell({ admin, email, children }: AdminShellProps) {
  const pathname = usePathname();
  const heading = pathname.startsWith("/admin/form")
    ? "Form Yönetimi"
    : pathname.startsWith("/admin/analytics")
      ? "Yanıt Analitiği"
      : pathname.startsWith("/admin/responses")
        ? "Yanıt Havuzu"
        : "Admin Panel";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand__eyebrow">Survey CMS</span>
          <h1>Gemiciler Araştırma Paneli</h1>
          <p>Form versiyonlarını, yanıtları ve raporlamayı tek yerden yönetin.</p>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                className={`admin-nav__link${active ? " admin-nav__link--active" : ""}`}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <div>
            <p className="admin-user__name">{admin.display_name ?? "Admin"}</p>
            <p className="admin-user__meta">
              {email} · {admin.role}
            </p>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div>
            <p className="section-eyebrow">Admin</p>
            <h2>{heading}</h2>
          </div>
          <Link className="ghost-button admin-header__link" href="/">
            Public formu aç
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
