"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "forbidden"
      ? "Bu kullanıcı admin panel erişimine sahip değil."
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Giriş başarısız.");
      }

      const next = searchParams.get("next") || "/admin/responses";
      router.replace(next);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Giriş başarısız.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="admin-login__form" onSubmit={handleSubmit}>
      <label className="question-card">
        <span className="question-card__label">E-posta</span>
        <input
          autoComplete="email"
          className="input-control"
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="question-card">
        <span className="question-card__label">Şifre</span>
        <input
          autoComplete="current-password"
          className="input-control"
          minLength={6}
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? <p className="admin-form__error">{error}</p> : null}

      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Giriş yapılıyor..." : "Admin giriş"}
      </button>
    </form>
  );
}
