import React from 'react';
import { OrderStatus, CustomerOrder } from '../backend';

interface OrderFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  orders: CustomerOrder[];
}

const filterOptions = [
  { value: 'all', label: 'All Orders' },
  { value: OrderStatus.pending, label: 'Pending' },
  { value: OrderStatus.delivered, label: 'Delivered' },
  { value: OrderStatus.cancelled, label: 'Cancelled' },
];

export default function OrderFilters({ activeFilter, onFilterChange, orders }: OrderFiltersProps) {
  const getCount = (value: string) => {
    if (value === 'all') return orders.length;
    return orders.filter((o) => o.status === value).length;
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filterOptions.map((option) => {
        const count = getCount(option.value);
        const isActive = activeFilter === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              isActive
                ? 'bg-orange-500 text-white shadow-orange'
                : 'bg-white text-gray-600 border border-orange-200 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            {option.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
