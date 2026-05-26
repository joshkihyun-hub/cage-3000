import { items } from '@/shared/constants/shop-items';

// Server-side product lookup so price/name cannot be tampered with on the client.
export function getProductById(id) {
  return items.find((item) => String(item.id) === String(id)) || null;
}

// Reflects the in-stock vs made-to-order display rule used on the storefront.
function isPriced(item) {
  return item.name === '03' || item.name === '07';
}

export function getProductUnitPrice(item) {
  if (!item) return 0;
  if (isPriced(item)) return Number(item.priceNum) || 0;
  return Number(item.priceNum) || 0;
}

export function generateOrderNumber() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${yyyy}${mm}${dd}-${rand}`;
}
