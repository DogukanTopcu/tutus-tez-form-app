import { AdminFormBuilder } from "@/components/admin/AdminFormBuilder";
import { getOrCreateDraftSurveyVersion, getPublishedSurveyVersion, getSurveyVersionMetas } from "@/lib/survey-store";
import { requireAdminPageAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminFormPage() {
  const access = await requireAdminPageAccess();
  const [draft, published, versions] = await Promise.all([
    getOrCreateDraftSurveyVersion(access.user.id),
    getPublishedSurveyVersion(),
    getSurveyVersionMetas(),
  ]);

  return (
    <AdminFormBuilder
      initialDraft={draft}
      initialPublished={published}
      versions={versions}
    />
  );
}
