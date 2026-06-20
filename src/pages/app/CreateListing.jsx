import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import AppNavbar from '../../components/app/AppNavbar';
import { categoryLabels, conditionLabels } from '../../components/shared/Badge';

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('appliances');
  const [condition, setCondition] = useState('good');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [status, setStatus] = useState('idle'); // idle | uploading | saving | error
  const [errorMsg, setErrorMsg] = useState('');

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Photo must be under 5MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Photo must be a JPEG, PNG, or WebP image.');
      return;
    }

    setErrorMsg('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim() || !price) {
      setErrorMsg('Please fill in title, description, and price.');
      return;
    }
    if (Number(price) < 0) {
      setErrorMsg('Price cannot be negative.');
      return;
    }

    let photoUrl = null;

    try {
      if (photoFile) {
        setStatus('uploading');
        const fileExt = photoFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(filePath, photoFile);

        if (uploadError) {
          throw new Error(uploadError.message || 'Photo upload failed.');
        }

        const { data: urlData } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }

      setStatus('saving');
      const { data: newListing, error: insertError } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          condition,
          photo_url: photoUrl,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message || 'Could not create listing.');
      }

      navigate(`/app/listing/${newListing.id}`);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  const isBusy = status === 'uploading' || status === 'saving';

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 w-full">
        <h1 className="font-display text-2xl font-semibold mb-6">Sell an item</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-[var(--radius-md)] bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] overflow-hidden flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">No photo</span>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                disabled={isBusy}
                className="text-sm text-[var(--text-secondary)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Item name
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dawlance Mini Fridge (1.5 cu ft)"
              maxLength={100}
              className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] focus:border-[var(--accent)] outline-none transition-colors"
              disabled={isBusy}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Condition details, how long you've used it, why you're selling, pickup availability..."
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] focus:border-[var(--accent)] outline-none transition-colors resize-none"
              disabled={isBusy}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Price (PKR)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="3500"
                className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] focus:border-[var(--accent)] outline-none transition-colors"
                disabled={isBusy}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] focus:border-[var(--accent)] outline-none transition-colors"
                disabled={isBusy}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium mb-2">
              Condition
            </label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg-base)] border border-[var(--border-strong)] focus:border-[var(--accent)] outline-none transition-colors"
              disabled={isBusy}
            >
              {Object.entries(conditionLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <p className="text-sm text-[var(--danger)]" role="alert">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg-base)] font-medium hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60"
          >
            {status === 'uploading' ? 'Uploading photo...' : status === 'saving' ? 'Posting...' : 'Post listing'}
          </button>
        </form>
      </main>
    </div>
  );
}
