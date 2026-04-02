"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import type { AdminResponseListItem } from "@/lib/survey-schema";
import type { SurveyVersionMeta } from "@/lib/survey-store";

type AdminResponsesPageProps = {
  initialResponses: AdminResponseListItem[];
  versions: SurveyVersionMeta[];
};

type ResponseFilters = {
  versionId: string;
  gender: string;
  role: string;
  shiftType: string;
  dateFrom: string;
  dateTo: string;
};

const INITIAL_FILTERS: ResponseFilters = {
  versionId: "",
  gender: "",
  role: "",
  shiftType: "",
  dateFrom: "",
  dateTo: "",
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function AdminResponsesPage({
  initialResponses,
  versions,
}: AdminResponsesPageProps) {
  const [filters, setFilters] = useState<ResponseFilters>(INITIAL_FILTERS);
  const [responses, setResponses] = useState(initialResponses);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const uniqueGenders = useMemo(
    () =>
      Array.from(new Set(initialResponses.map((item) => item.gender).filter(Boolean))).sort((a, b) =>
        a!.localeCompare(b!, "tr"),
      ),
    [initialResponses],
  );
  const uniqueRoles = useMemo(
    () =>
      Array.from(new Set(initialResponses.map((item) => item.role).filter(Boolean))).sort((a, b) =>
        a!.localeCompare(b!, "tr"),
      ),
    [initialResponses],
  );
  const uniqueShiftTypes = useMemo(
    () =>
      Array.from(new Set(initialResponses.map((item) => item.shiftType).filter(Boolean))).sort((a, b) =>
        a!.localeCompare(b!, "tr"),
      ),
    [initialResponses],
  );

  useEffect(() => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });

    const controller = new AbortController();

    fetch(`/api/admin/responses?${searchParams.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          error?: string;
          responses?: AdminResponseListItem[];
        };
        if (!response.ok || !data.responses) {
          throw new Error(data.error ?? "Yanıt listesi yüklenemedi.");
        }
        setResponses(data.responses);
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Liste yüklenemedi.");
      });

    return () => controller.abort();
  }, [filters]);

  const updateFilters = (patch: Partial<ResponseFilters>) => {
    setError(null);
    startTransition(() => {
      setFilters((current) => ({ ...current, ...patch }));
    });
  };

  const handleDelete = async (id: string) => {
    const approved = window.confirm("Bu yanıt soft delete olarak işaretlenecek. Devam edilsin mi?");
    if (!approved) {
      return;
    }

    setError(null);
    try {
      const response = await fetch(`/api/admin/responses/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Yanıt silinemedi.");
      }
      setResponses((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Yanıt silinemedi.");
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel__controls">
        <div className="admin-filter-grid">
          <label className="question-card question-card--compact">
            <span className="question-card__label">Versiyon</span>
            <select
              className="select-control"
              value={filters.versionId}
              onChange={(event) =>
                updateFilters({ versionId: event.target.value })
              }
            >
              <option value="">Tümü</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  v{version.versionNumber} · {version.status}
                </option>
              ))}
            </select>
          </label>

          <label className="question-card question-card--compact">
            <span className="question-card__label">Cinsiyet</span>
            <select
              className="select-control"
              value={filters.gender}
              onChange={(event) =>
                updateFilters({ gender: event.target.value })
              }
            >
              <option value="">Tümü</option>
              {uniqueGenders.map((gender) => (
                <option key={gender} value={gender ?? ""}>
                  {gender}
                </option>
              ))}
            </select>
          </label>

          <label className="question-card question-card--compact">
            <span className="question-card__label">Görev</span>
            <select
              className="select-control"
              value={filters.role}
              onChange={(event) =>
                updateFilters({ role: event.target.value })
              }
            >
              <option value="">Tümü</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role ?? ""}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="question-card question-card--compact">
            <span className="question-card__label">Vardiya</span>
            <select
              className="select-control"
              value={filters.shiftType}
              onChange={(event) =>
                updateFilters({ shiftType: event.target.value })
              }
            >
              <option value="">Tümü</option>
              {uniqueShiftTypes.map((shiftType) => (
                <option key={shiftType} value={shiftType ?? ""}>
                  {shiftType}
                </option>
              ))}
            </select>
          </label>

          <label className="question-card question-card--compact">
            <span className="question-card__label">Başlangıç</span>
            <input
              className="input-control"
              type="date"
              value={filters.dateFrom}
              onChange={(event) =>
                updateFilters({ dateFrom: event.target.value })
              }
            />
          </label>

          <label className="question-card question-card--compact">
            <span className="question-card__label">Bitiş</span>
            <input
              className="input-control"
              type="date"
              value={filters.dateTo}
              onChange={(event) =>
                updateFilters({ dateTo: event.target.value })
              }
            />
          </label>
        </div>

        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            setError(null);
            startTransition(() => setFilters(INITIAL_FILTERS));
          }}
        >
          Filtreleri temizle
        </button>
      </div>

      {error ? <p className="admin-form__error">{error}</p> : null}

      <div className="admin-table-card">
        <div className="admin-table-card__header">
          <h3>Yanıt listesi</h3>
          <span>{isPending ? "Yükleniyor..." : `${responses.length} kayıt`}</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Versiyon</th>
                <th>Yaş</th>
                <th>Cinsiyet</th>
                <th>Görev</th>
                <th>Vardiya</th>
                <th>PSQI</th>
                <th>UPF</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {responses.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>{item.versionNumber ? `v${item.versionNumber}` : "—"}</td>
                  <td>{item.age ?? "—"}</td>
                  <td>{item.gender ?? "—"}</td>
                  <td>{item.role ?? "—"}</td>
                  <td>{item.shiftType ?? "—"}</td>
                  <td>{item.psqiScore ?? "—"}</td>
                  <td>{item.ultraProcessedYesCount ?? "—"}</td>
                  <td className="admin-table__actions">
                    <Link className="ghost-button" href={`/admin/responses/${item.id}`}>
                      Detay
                    </Link>
                    <button className="danger-button" type="button" onClick={() => handleDelete(item.id)}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {responses.length === 0 ? (
                <tr>
                  <td className="admin-table__empty" colSpan={9}>
                    Eşleşen yanıt bulunamadı.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
