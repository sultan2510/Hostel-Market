import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

const steps = [
  {
    title: 'Sign up with your NUST school email',
    body: 'Use your official school email (e.g. @seecs.nust.edu.pk, @nbs.nust.edu.pk). Other email providers are rejected automatically.',
  },
  {
    title: 'Verify with a one-time code',
    body: "We'll email you a 6-digit code. Enter it to confirm the account is really yours.",
  },
  {
    title: 'Complete your profile',
    body: 'Add your name, phone number, and hostel/address — this stays hidden until a buyer chooses to reveal it on your listing.',
  },
  {
    title: 'Browse or post listings',
    body: 'Search by category, condition, and price, or post your own item with a photo in under a minute.',
  },
  {
    title: 'Connect and arrange the handoff',
    body: "Interested buyers reveal your contact info and reach out directly. You arrange the meeting place, time, and payment method between yourselves.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl font-semibold mb-10">How it works</h1>
        <div className="space-y-8">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-5">
              <div className="w-9 h-9 rounded-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] flex items-center justify-center font-display text-sm text-[var(--accent)] shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-1">{s.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/signup"
            className="inline-block px-6 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors"
          >
            Sign up now
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
