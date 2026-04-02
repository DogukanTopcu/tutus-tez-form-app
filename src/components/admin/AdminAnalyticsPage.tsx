"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsPayload } from "@/lib/survey-store";

type AnalyticsFilters = {
  versionId: string;
  gender: string;
  role: string;
  shiftType: string;
  dateFrom: string;
  dateTo: string;
};

type AdminAnalyticsPageProps = {
  initialAnalytics: AnalyticsPayload;
};

const INITIAL_FILTERS: AnalyticsFilters = {
  versionId: "",
  gender: "",
  role: "",
  shiftType: "",
  dateFrom: "",
  dateTo: "",
};

const CHART_COLORS = ["#9b4f2e", "#d38d5f", "#35524a", "#8b6b4e", "#457b9d", "#c05621"];

function ChartCard({
  title,
  data,
  type = "bar",
}: {
  title: string;
  data: { label: string; value: number }[];
  type?: "bar" | "pie";
}) {
  return (
    <article className="admin-chart-card">
      <header className="admin-chart-card__header">
        <h3>{title}</h3>
        <span>{data.reduce((sum, item) => sum + item.value, 0)} kayıt</span>
      </header>
      <div className="admin-chart-card__body">
        <ResponsiveContainer height={260} width="100%">
          {type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd7" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#9b4f2e" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={data} dataKey="value" nameKey="label" outerRadius={88}>
                {data.map((entry, index) => (
                  <Cell
                    key={`${entry.label}-${entry.value}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export function AdminAnalyticsPage({ initialAnalytics }: AdminAnalyticsPageProps) {
  const [filters, setFilters] = useState<AnalyticsFilters>(INITIAL_FILTERS);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const genderOptions = useMemo(
    () => initialAnalytics.genderBreakdown.map((item) => item.label),
    [initialAnalytics.genderBreakdown],
  );
  const roleOptions = useMemo(
    () => initialAnalytics.roleBreakdown.map((item) => item.label),
    [initialAnalytics.roleBreakdown],
  );
  const shiftTypeOptions = useMemo(
    () => initialAnalytics.shiftTypeBreakdown.map((item) => item.label),
    [initialAnalytics.shiftTypeBreakdown],
  );

  useEffect(() => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });

    const controller = new AbortController();

    fetch(`/api/admin/analytics?${searchParams.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as { error?: string; analytics?: AnalyticsPayload };
        if (!response.ok || !data.analytics) {
          throw new Error(data.error ?? "Analitik verisi yüklenemedi.");
        }
        setAnalytics(data.analytics);
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Analitik verisi yüklenemedi.");
      });

    return () => controller.abort();
  }, [filters]);

  const updateFilters = (patch: Partial<AnalyticsFilters>) => {
    setError(null);
    startTransition(() => {
      setFilters((current) => ({ ...current, ...patch }));
    });
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
              {analytics.availableVersions.map((version) => (
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
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
              {shiftTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
      </div>

      {error ? <p className="admin-form__error">{error}</p> : null}

      <div className="admin-kpi-grid">
        <article className="admin-kpi-card">
          <span>Toplam yanıt</span>
          <strong>{analytics.kpis.totalResponses}</strong>
        </article>
        <article className="admin-kpi-card">
          <span>Ortalama yaş</span>
          <strong>{analytics.kpis.averageAge ?? "—"}</strong>
        </article>
        <article className="admin-kpi-card">
          <span>Ortalama BMI</span>
          <strong>{analytics.kpis.averageBodyMassIndex ?? "—"}</strong>
        </article>
        <article className="admin-kpi-card">
          <span>Ortalama PSQI</span>
          <strong>{analytics.kpis.averagePsqiScore ?? "—"}</strong>
        </article>
        <article className="admin-kpi-card">
          <span>Ortalama UPF</span>
          <strong>{analytics.kpis.averageUpfCount ?? "—"}</strong>
        </article>
      </div>

      <article className="admin-chart-card admin-chart-card--wide">
        <header className="admin-chart-card__header">
          <h3>Günlük submit trendi</h3>
          <span>{isPending ? "Yükleniyor..." : `${analytics.submissionsOverTime.length} gün`}</span>
        </header>
        <div className="admin-chart-card__body">
          <ResponsiveContainer height={320} width="100%">
            <LineChart data={analytics.submissionsOverTime}>
              <CartesianGrid stroke="#e2ddd7" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line dataKey="count" stroke="#9b4f2e" strokeWidth={3} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="admin-chart-grid">
        <ChartCard data={analytics.ageDistribution} title="Yaş dağılımı" />
        <ChartCard data={analytics.genderBreakdown} title="Cinsiyet kırılımı" type="pie" />
        <ChartCard data={analytics.roleBreakdown} title="Görev dağılımı" />
        <ChartCard data={analytics.shiftTypeBreakdown} title="Vardiya dağılımı" />
        <ChartCard data={analytics.bmiDistribution} title="BMI kategorileri" />
        <ChartCard data={analytics.psqiDistribution} title="PSQI dağılımı" />
        <ChartCard data={analytics.stoolDistribution} title="Bristol dağılımı" />
        <ChartCard data={analytics.upfDistribution} title="UPF evet histogramı" />
      </div>

      <section className="admin-chart-stack">
        <div className="admin-chart-stack__header">
          <h3>Soru bazlı grafikler</h3>
          <span>{analytics.questionCharts.length} grafik</span>
        </div>
        <div className="admin-chart-grid">
          {analytics.questionCharts.map((chart) => (
            <ChartCard key={chart.id} data={chart.data} title={chart.label} />
          ))}
        </div>
      </section>
    </section>
  );
}
