import { Link } from "react-router-dom";

export default function ClientPublicLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-brand-primary text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-sm opacity-90">Salafni - سلفني</p>
          <h1 className="mt-2 text-4xl font-bold">Achetez maintenant, payez plus tard</h1>
          <p className="mt-3 max-w-2xl text-sm opacity-90">
            Salafni vous permet de financer vos achats essentiels en 4 paiements hebdomadaires simples,
            avec un suivi transparent de votre score de confiance.
          </p>
          <p className="mt-2 text-xl">اشتري الآن، ادفع لاحقاً</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/client/register" className="rounded bg-brand-accent px-4 py-2 font-semibold text-white">
              Creer un compte
            </Link>
            <Link to="/client/login" className="rounded border border-white px-4 py-2 font-semibold text-white">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-semibold text-brand-primary">Comment ca marche</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <Step n="1" title="Inscription" body="Creez votre compte avec CIN et numero de telephone." />
          <Step n="2" title="KYC" body="Uploadez CIN front/back, selfie et preuve d'activite." />
          <Step n="3" title="Demande de pret" body="Choisissez un marchand partenaire et le montant." />
          <Step n="4" title="Remboursement" body="Payez sur 4 semaines et augmentez votre credit score." />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="rounded bg-white p-6 shadow">
          <h3 className="text-xl font-semibold">Pourquoi Salafni ?</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>100% en Dinar Tunisien (DT)</li>
            <li>Validation claire des demandes et du statut KYC</li>
            <li>Suivi du score de credit et progression de paliers</li>
            <li>Design mobile-first, FR + AR</li>
          </ul>
          <div className="mt-5 flex gap-3">
            <Link to="/client/register" className="rounded bg-brand-primary px-4 py-2 text-white">
              Commencer
            </Link>
            <Link to="/admin" className="rounded border px-4 py-2">
              Espace admin
            </Link>
            <Link to="/merchant" className="rounded border px-4 py-2">
              Espace marchand
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({ n, title, body }) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <div className="text-sm font-semibold text-brand-primary">Etape {n}</div>
      <h3 className="mt-1 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}
