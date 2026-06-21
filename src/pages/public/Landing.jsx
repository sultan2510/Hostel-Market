import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

const categories = [
  { label: 'Mini fridges', icon: '🧊' },
  { label: 'Air coolers', icon: '🌀' },
  { label: 'Mattresses', icon: '🛏️' },
  { label: 'Textbooks', icon: '📚' },
  { label: 'Drafters & calculators', icon: '📐' },
  { label: 'Irons & appliances', icon: '🔌' },
];

const steps = [
  {
    title: 'Verify with your org email',
    body: 'Sign up using your university or hostel email. One quick sign-in link and you\'re confirmed as a resident — no outsiders, ever.',
  },
  {
    title: 'Browse your block',
    body: 'See listings from students actually living around you. Filter by hostel, category, and price.',
  },
  {
    title: 'Meet, inspect, pay your way',
    body: 'Hand off in person within campus grounds. Pay cash on delivery, or settle instantly via Easypaisa or JazzCash.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,255,30,0.14), transparent 70%)',
            }}
          />
          <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Verified hostel residents only
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] mb-6">
              Move out.<br />
              <span className="text-[var(--accent)]">Move in.</span><br />
              Without the moving truck.
            </h1>

            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Buy and sell mini-fridges, mattresses, textbooks, and dorm essentials
              with students who already live where you live. No scams, no strangers,
              no shipping — just your own hostel block.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link
                to="/signup"
                className="px-6 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors"
              >
                Sign up with org email
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Signature visual: verification badge stack instead of generic dashboard mockup */}
          <div className="max-w-3xl mx-auto px-6 pb-24 relative">
            <div className="relative h-64 flex items-center justify-center">
              <BadgeCard
                rotate="-8deg"
                offsetX="-180px"
                name="Aisha R."
                hostel="Block C · Room 214"
                tag="Verified resident"
              />
              <BadgeCard
                rotate="0deg"
                offsetX="0px"
                name="Hamza K."
                hostel="Block A · Room 108"
                tag="Verified resident"
                elevated
              />
              <BadgeCard
                rotate="9deg"
                offsetX="180px"
                name="Sana M."
                hostel="Block D · Room 305"
                tag="Verified resident"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6 text-center">
            What people actually trade between move-in and move-out
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-3 px-4 py-4 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-sm text-[var(--text-secondary)]">{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works preview */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <h2 className="font-display text-3xl font-semibold text-center mb-12">
            Three steps. Zero outsiders.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="p-6 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] flex items-center justify-center font-display text-sm text-[var(--accent)] mb-4">
                  {i + 1}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/how-it-works"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              See the full walkthrough →
            </Link>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
          <h2 className="font-display text-3xl font-semibold mb-4">
            Your hostel already has what you need.
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Stop dragging a mattress across the country. Someone two floors down
            is selling exactly what you're looking for.
          </p>
          <Link
            to="/signup"
            className="inline-block px-7 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors"
          >
            Get verified — it takes 2 minutes
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function BadgeCard({ rotate, offsetX, name, hostel, tag, elevated }) {
  return (
    <div
      className="absolute w-48 p-4 rounded-[var(--radius-md)] border bg-[var(--bg-surface-raised)] transition-transform"
      style={{
        transform: `translateX(${offsetX}) rotate(${rotate})`,
        borderColor: elevated ? 'var(--accent-deep)' : 'var(--border-subtle)',
        boxShadow: elevated
          ? '0 20px 60px -10px rgba(200,255,30,0.25)'
          : '0 15px 40px -15px rgba(0,0,0,0.5)',
        zIndex: elevated ? 10 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 border border-[var(--accent-deep)] flex items-center justify-center text-xs font-display text-[var(--accent)]">
          {name.charAt(0)}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent-deep)]">
          {tag}
        </span>
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)]">{name}</p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">{hostel}</p>
    </div>
  );
}