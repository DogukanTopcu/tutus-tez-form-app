import Link from "next/link";

import { SurveyResults } from "@/components/SurveyForm";
import { getAdminResponseDetail } from "@/lib/survey-store";

export const dynamic = "force-dynamic";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default async function AdminResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getAdminResponseDetail(id);

  return (
    <section className="admin-panel admin-detail">
      <div className="admin-detail__header">
        <div>
          <p className="section-eyebrow">Response Detail</p>
          <h3>Yanıt #{response.id.slice(0, 8)}</h3>
          <p className="admin-muted">
            {formatDateTime(response.createdAt)} · version{" "}
            {response.surveyVersionNumber ? `v${response.surveyVersionNumber}` : "—"}
          </p>
        </div>
        <Link className="ghost-button" href="/admin/responses">
          Listeye dön
        </Link>
      </div>

      <div className="admin-kpi-grid">
        <article className="admin-kpi-card">
          <span>Yaş</span>
          <strong>{response.age ?? "—"}</strong>
        </article>
        <article className="admin-kpi-card">
          <span>Görev</span>
          <strong>{response.role ?? "—"}</strong>
        </article>
        <article className="admin-kpi-card">
          <span>Vardiya</span>
          <strong>{response.shiftType ?? "—"}</strong>
        </article>
        <article className="admin-kpi-card">
          <span>BMI</span>
          <strong>{response.bmi ?? "—"}</strong>
        </article>
        <article className="admin-kpi-card">
          <span>PSQI</span>
          <strong>{response.psqiScore ?? "—"}</strong>
        </article>
      </div>

      <SurveyResults responses={response.responses} schema={response.surveySnapshot} />
    </section>
  );
}
