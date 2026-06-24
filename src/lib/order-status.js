// Single source of truth for OrderStatus values, Korean labels, and admin
// badge styling. Mirrors the `OrderStatus` enum in prisma/schema.prisma.
// Imported by both server routes (validation) and client admin UI (display)
// so the list never drifts between places.

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'failed',
];

export const ORDER_STATUS_LABEL = {
  pending: '결제 대기',
  paid: '결제 완료',
  preparing: '제작 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소',
  refunded: '환불',
  failed: '실패',
};

// Tailwind classes for the status pill in the admin order views.
export const ORDER_STATUS_BADGE = {
  pending: 'bg-zinc-50 text-zinc-600 border-zinc-200',
  paid: 'bg-blue-50 text-blue-700 border-blue-100',
  preparing: 'bg-amber-50 text-amber-700 border-amber-100',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  refunded: 'bg-rose-50 text-rose-600 border-rose-100',
  failed: 'bg-red-50 text-red-600 border-red-100',
};

// Statuses that count as "revenue earned" (paid and everything downstream of it,
// excluding cancelled/refunded/failed). Used for admin revenue aggregation.
export const REVENUE_STATUSES = ['paid', 'preparing', 'shipped', 'delivered'];

export function isValidOrderStatus(value) {
  return ORDER_STATUSES.includes(value);
}

export function orderStatusLabel(value) {
  return ORDER_STATUS_LABEL[value] || value;
}
