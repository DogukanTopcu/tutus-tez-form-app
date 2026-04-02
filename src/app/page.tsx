import { SurveyForm } from "@/components/SurveyForm";
import { createDefaultSurveySchema } from "@/lib/survey-schema";
import { getPublishedSurveyVersion } from "@/lib/survey-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const publishedVersion = await getPublishedSurveyVersion().catch(() => null);
  const schema = publishedVersion?.schema ?? createDefaultSurveySchema();
  const versionId = publishedVersion?.id ?? "local-fallback";

  return (
    <main className="page-shell">
      <header className="page-header">
        <h1>{schema.title}</h1>
        <p className="page-lead">{schema.description}</p>
        <span className="time-badge">≈ {schema.estimatedMinutes} dakika</span>
      </header>

      <SurveyForm mode="public" schema={schema} versionId={versionId} />
    </main>
  );
}
