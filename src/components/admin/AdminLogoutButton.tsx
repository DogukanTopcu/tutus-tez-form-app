"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button className="ghost-button" disabled={isPending} type="button" onClick={handleLogout}>
      {isPending ? "Çıkış..." : "Çıkış yap"}
    </button>
  );
}
