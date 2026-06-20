import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl font-semibold mb-6">About us</h1>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          HostelMarket was built by NUST students for NUST students — dayscholars
          and hostellites alike. Every academic cycle, incoming students scramble
          to source fridges, mattresses, and textbooks, while graduating seniors
          scramble to offload the exact same items before clearing out. We built
          a closed platform to connect those two moments directly, without
          dragging in strangers from the open internet.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          Access is restricted to verified NUST H-12 (Islamabad) school email
          addresses — confirmed through a one-time code sent to your inbox. No
          outsiders, no random social media accounts, no guesswork about who
          you're dealing with.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          We don't process payments or hold funds. Buyers and sellers arrange
          the handoff and payment method themselves — we just make it easy to
          find each other.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
