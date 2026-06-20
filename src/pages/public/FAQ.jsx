import { useState } from 'react';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';

const faqs = [
  {
    q: 'Who can sign up?',
    a: 'Any current NUST student at the H-12 Islamabad campus with a valid school email — dayscholars and hostel residents are both welcome. Other NUST campuses (e.g. PNEC Karachi, CAE Risalpur, EME, MCS) are not currently included.',
  },
  {
    q: 'Is there a fee to use the platform?',
    a: "No. Posting and browsing listings is free. We don't take a cut of any sale.",
  },
  {
    q: 'Does the platform handle payments?',
    a: 'No. Buyers and sellers arrange payment directly between themselves (cash, bank transfer, mobile wallet, etc.) — we only help you find and contact each other.',
  },
  {
    q: 'Who can see my phone number and address?',
    a: 'Only logged-in, verified users who specifically click "Reveal contact info" on one of your listings. Your contact details are never shown publicly or to non-verified visitors.',
  },
  {
    q: 'What if someone scams me or behaves badly?',
    a: "Report the listing or user from the listing page. Because every account is tied to a verified school email, bad behavior isn't anonymous the way it is on open marketplaces.",
  },
  {
    q: 'Can I edit or remove a listing after posting it?',
    a: 'Yes — go to "My listings" to mark an item as sold, relist it, or delete it permanently.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl font-semibold mb-10">FAQ</h1>
        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.q}
                className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium">{item.q}</span>
                  <span className="text-[var(--accent)] shrink-0">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
