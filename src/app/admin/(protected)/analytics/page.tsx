import { AdminAnalyticsPage } from "@/components/admin/AdminAnalyticsPage";
import { getAnalyticsPayload } from "@/lib/survey-store";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsRoutePage() {
  const analytics = await getAnalyticsPayload();

  return <AdminAnalyticsPage initialAnalytics={analytics} />;
}
