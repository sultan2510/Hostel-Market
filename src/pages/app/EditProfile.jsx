import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { isValidPakistaniPhone, PHONE_VALIDATION_ERROR } from '../../lib/validators';
import AppNavbar from '../../components/app/AppNavbar';

export default function EditProfile() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [hostelOrAddress, setHostelOrAddress] = useState(profile?.hostel_or_address || '');
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !phoneNumber.trim() || !hostelOrAddress.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (!isValidPakistaniPhone(phoneNumber)) {
      setErrorMsg(PHONE_VALIDATION_ERROR);
      return;
    }

    setStatus('saving');

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        hostel_or_address: hostelOrAddress.trim(),
      })
      .eq('id', profile.id);

    if (error) {
      setStatus('error');
      setErrorMsg(error.message || 'Could not save changes. Please try again.');
      return;
    }

    await refreshProfile();
    setStatus('saved');
  }

  const isBusy = status === 'saving';

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <button
              onClick={() => navigate('/app/profile')}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 inline-block"
            >
              ← Back to my listings
            </button>
            <h1 className="font-display text-3xl font-semibold mb-2">Edit account</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Update your contact details — this is what buyers see when they reveal
              contact info on your listings.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 space-y-4"
          >
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ali Khan"
                className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none transition-colors"
                disabled={isBusy}
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
                Phone number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+]/g, ''))}
                placeholder="03001234567"
                className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none transition-colors"
                disabled={isBusy}
                required
              />
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                11 digits, starting with 03 (e.g. 03001234567)
              </p>
            </div>

            <div>
              <label htmlFor="hostelOrAddress" className="block text-sm font-medium mb-2">
                Hostel block / address
              </label>
              <input
                id="hostelOrAddress"
                type="text"
                value={hostelOrAddress}
                onChange={(e) => setHostelOrAddress(e.target.value)}
                placeholder="e.g. Hostel 5, Room 212 — or dayscholar pickup point"
                className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none transition-colors"
                disabled={isBusy}
                required
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-[var(--danger)]" role="alert">
                {errorMsg}
              </p>
            )}

            {status === 'saved' && (
              <p className="text-sm text-[var(--accent)]">Changes saved.</p>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBusy ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}