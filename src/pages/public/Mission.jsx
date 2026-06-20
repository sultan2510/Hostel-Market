import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function Mission() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl font-semibold mb-6">Our mission</h1>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          To make moving in and moving out of NUST as frictionless as possible —
          by keeping essential items circulating within the community instead of
          being shipped in from home cities or thrown away at graduation.
        </p>
        <ul className="space-y-4 text-[var(--text-secondary)]">
          <li className="flex gap-3">
            <span className="text-[var(--accent)]">→</span>
            Eliminate the trust problem of buying from strangers online.
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--accent)]">→</span>
            Save new students the cost and hassle of transporting heavy items.
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--accent)]">→</span>
            Help graduating students recover value instead of discarding items.
          </li>
          <li className="flex gap-3">
            <span className="text-[var(--accent)]">→</span>
            Keep the whole exchange inside a verified university community.
          </li>
        </ul>
      </main>
      <PublicFooter />
    </div>
  );
}
