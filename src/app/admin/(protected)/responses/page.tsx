import { AdminResponsesPage } from "@/components/admin/AdminResponsesPage";
import { listAdminResponses, getSurveyVersionMetas } from "@/lib/survey-store";

export const dynamic = "force-dynamic";

export default async function AdminResponsesRoutePage() {
  const [responses, versions] = await Promise.all([
    listAdminResponses(),
    getSurveyVersionMetas(),
  ]);

  return <AdminResponsesPage initialResponses={responses} versions={versions} />;
}
