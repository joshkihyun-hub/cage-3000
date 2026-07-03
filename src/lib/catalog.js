import crypto from 'crypto';
import { items } from '@/shared/constants/shop-items';

// Server-side product lookup so price/name cannot be tampered with on the client.
export function getProductById(id) {
  return items.find((item) => String(item.id) === String(id)) || null;
}

export function getProductUnitPrice(item) {
  return Number(item?.priceNum) || 0;
}

export function generateOrderNumber() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  // Crypto randomness: order numbers double as the PortOne paymentId, so they
  // must be unguessable (Math.random is predictable) and collision-resistant.
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ORD-${yyyy}${mm}${dd}-${rand}`;
}
