import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { isValidPakistaniPhone, PHONE_VALIDATION_ERROR } from '../../lib/validators';

export default function CompleteProfile() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hostelOrAddress, setHostelOrAddress] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !phoneNumber.trim() || !hostelOrAddress.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    // Pakistani mobile number must be exactly 11 digits (03XXXXXXXXX) or
    // the +92 international equivalent.
    if (!isValidPakistaniPhone(phoneNumber)) {
      setErrorMsg(PHONE_VALIDATION_ERROR);
      return;
    }

    setStatus('saving');

    const email = user.email;
    const domain = email.split('@')[1];

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName.trim(),
      email,
      school_domain: domain,
      phone_number: phoneNumber.trim(),
      hostel_or_address: hostelOrAddress.trim(),
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message || 'Could not save profile. Please try again.');
      return;
    }

    await refreshProfile();
    navigate('/app');
  }

  const isBusy = status === 'saving';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[var(--bg-base)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold mb-2">One last step</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            This info is shown to buyers/sellers only after they choose to view your
            contact details on a listing.
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

          <button
            type="submit"
            disabled={isBusy}
            className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBusy ? 'Saving...' : 'Enter marketplace'}
          </button>
        </form>
      </div>
    </div>
  );
}