import { categoryLabels, conditionLabels } from '../shared/Badge';

export default function FilterSidebar({ filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className="w-full md:w-60 shrink-0 space-y-6">
      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Search
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Search listings..."
          className="w-full px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Category
        </label>
        <div className="space-y-1">
          <button
            onClick={() => update('category', null)}
            className={`block w-full text-left text-sm px-3 py-2 rounded-[var(--radius-sm)] transition-colors ${
              !filters.category
                ? 'bg-[var(--accent)] text-[var(--bg-base)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            All categories
          </button>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => update('category', value)}
              className={`block w-full text-left text-sm px-3 py-2 rounded-[var(--radius-sm)] transition-colors ${
                filters.category === value
                  ? 'bg-[var(--accent)] text-[var(--bg-base)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Condition
        </label>
        <div className="space-y-1">
          <button
            onClick={() => update('condition', null)}
            className={`block w-full text-left text-sm px-3 py-2 rounded-[var(--radius-sm)] transition-colors ${
              !filters.condition
                ? 'bg-[var(--accent)] text-[var(--bg-base)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Any condition
          </button>
          {Object.entries(conditionLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => update('condition', value)}
              className={`block w-full text-left text-sm px-3 py-2 rounded-[var(--radius-sm)] transition-colors ${
                filters.condition === value
                  ? 'bg-[var(--accent)] text-[var(--bg-base)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Max price (PKR)
        </label>
        <input
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={(e) => update('maxPrice', e.target.value)}
          placeholder="No limit"
          className="w-full px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none transition-colors"
        />
      </div>
    </aside>
  );
}
