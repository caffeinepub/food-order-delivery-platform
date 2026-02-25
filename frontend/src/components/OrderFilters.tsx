import { OrderStatus } from '../backend';

interface OrderFiltersProps {
  activeFilter: OrderStatus | 'all';
  onFilterChange: (filter: OrderStatus | 'all') => void;
  counts: Record<string, number>;
}

const FILTERS: { value: OrderStatus | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '📋' },
  { value: OrderStatus.pending, label: 'Pending', emoji: '⏳' },
  { value: OrderStatus.accepted, label: 'Accepted', emoji: '✅' },
  { value: OrderStatus.preparing, label: 'Preparing', emoji: '👨‍🍳' },
  { value: OrderStatus.out_for_delivery, label: 'Delivery', emoji: '🛵' },
  { value: OrderStatus.delivered, label: 'Delivered', emoji: '🎉' },
  { value: OrderStatus.cancelled, label: 'Cancelled', emoji: '❌' },
];

export function OrderFilters({ activeFilter, onFilterChange, counts }: OrderFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTERS.map((filter) => {
        const count = filter.value === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[filter.value] ?? 0);
        const isActive = activeFilter === filter.value;

        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground'
            }`}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
            {count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
