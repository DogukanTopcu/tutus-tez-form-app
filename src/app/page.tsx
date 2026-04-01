import { SurveyForm } from "@/components/SurveyForm";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <h1>Gemicilerde Beslenme ve Uyku Kalitesi Anketi</h1>
        <p className="page-lead">
          Bu form, denizcilik sektöründe çalışan bireylerin beslenme alışkanlıkları ve uyku
          kalitesi üzerine yürütülen akademik bir araştırma kapsamında hazırlanmıştır. Tüm
          yanıtlar anonimdir.
        </p>
        <span className="time-badge">≈ 12–18 dakika</span>
      </header>

      <SurveyForm />
    </main>
  );
}
