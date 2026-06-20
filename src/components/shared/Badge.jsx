const variants = {
  category: 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
  condition: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent-deep)]',
  status: 'bg-[var(--warn)]/10 text-[var(--warn)] border-[var(--warn)]/40',
};

const categoryLabels = {
  appliances: 'Appliances',
  furniture: 'Furniture',
  books: 'Books',
  electronics: 'Electronics',
  project_equipment: 'Project equipment',
  other: 'Other',
};

const conditionLabels = {
  new: 'New',
  like_new: 'Like new',
  good: 'Good',
  fair: 'Fair',
  worn: 'Worn',
};

export function CategoryBadge({ category }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${variants.category}`}>
      {categoryLabels[category] || category}
    </span>
  );
}

export function ConditionBadge({ condition }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${variants.condition}`}>
      {conditionLabels[condition] || condition}
    </span>
  );
}

export function StatusBadge({ status }) {
  if (status === 'active') return null;
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${variants.status}`}>
      {status === 'sold' ? 'Sold' : 'Removed'}
    </span>
  );
}

export { categoryLabels, conditionLabels };
