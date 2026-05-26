'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const STATUS_LABEL = {
  pending: '결제 대기',
  paid: '결제 완료',
  preparing: '제작 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소',
  refunded: '환불',
  failed: '실패',
};

const CARRIERS = ['CJ대한통운', '우체국', '한진택배', '롯데택배', '로젠택배', 'EMS', 'DHL'];

function formatDateTime(value) {
  if (!value) return '-';
  try { return new Date(value).toLocaleString('ko-KR'); } catch { return '-'; }
}

function formatKRW(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

export default function OrderDetailDrawer({ orderId, onClose, onUpdated }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [statusDraft, setStatusDraft] = useState('pending');
  const [carrierDraft, setCarrierDraft] = useState('');
  const [trackingDraft, setTrackingDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    if (!orderId) { setOrder(null); return; }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/admin/orders/${orderId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('조회 실패');
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setOrder(json.order);
        setStatusDraft(json.order.status);
        setCarrierDraft(json.order.trackingCarrier || '');
        setTrackingDraft(json.order.trackingNumber || '');
        setNoteDraft(json.order.adminNote || '');
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [orderId, onClose]);

  if (!orderId) return null;

  const dirty = order && (
    statusDraft !== order.status ||
    (carrierDraft || '') !== (order.trackingCarrier || '') ||
    (trackingDraft || '') !== (order.trackingNumber || '') ||
    (noteDraft || '') !== (order.adminNote || '')
  );

  const handleSave = async () => {
    if (!order) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusDraft,
          trackingCarrier: carrierDraft,
          trackingNumber: trackingDraft,
          adminNote: noteDraft,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '저장 실패');
      setOrder(json.order);
      onUpdated?.(json.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-zinc-100 z-10 flex items-center justify-between px-8 py-5">
          <div>
            <h2 className="font-serif text-lg uppercase tracking-wide">Order Detail</h2>
            {order && <p className="font-mono text-xs text-zinc-400 mt-1">{order.orderNumber}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-8 space-y-10">
          {loading && <p className="text-xs uppercase tracking-widest text-zinc-400">Loading...</p>}
          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 py-2 px-3">{error}</p>}

          {order && !loading && (
            <>
              {/* Customer */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">Customer</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <Field label="Name" value={order.user?.name} />
                  <Field label="Email" value={order.user?.email} />
                  <Field label="Phone" value={order.user?.phoneNumber} />
                  <Field label="Joined" value={order.user?.createdAt ? formatDateTime(order.user.createdAt) : '-'} />
                </div>
              </section>

              {/* Items */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">Items</h3>
                <ul className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm border-b border-zinc-100 pb-3">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{formatKRW(item.unitPrice)} × {item.quantity}</p>
                      </div>
                      <p>{formatKRW(item.subtotal)}</p>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-zinc-500">Subtotal</span>
                  <span>{formatKRW(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Shipping</span>
                  <span>{formatKRW(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 mt-2 border-t border-zinc-200 font-medium">
                  <span>Total</span>
                  <span className="font-serif">{formatKRW(order.totalAmount)}</span>
                </div>
              </section>

              {/* Shipping */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">Shipping</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <Field label="Recipient" value={order.recipientName} />
                  <Field label="Phone" value={order.recipientPhone} />
                  <Field
                    label="Address"
                    value={`(${order.shippingZipCode || ''}) ${order.shippingAddress} ${order.shippingDetail || ''}`}
                  />
                  <Field label="Customer note" value={order.customerNote} />
                </div>
              </section>

              {/* Timeline */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">Timeline</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <Field label="Created" value={formatDateTime(order.createdAt)} />
                  <Field label="Paid" value={formatDateTime(order.paidAt)} />
                  <Field label="Shipped" value={formatDateTime(order.shippedAt)} />
                  <Field label="Delivered" value={formatDateTime(order.deliveredAt)} />
                  <Field label="Cancelled" value={formatDateTime(order.cancelledAt)} />
                  <Field label="Payment" value={order.paymentMethod} />
                </div>
              </section>

              {/* Admin controls */}
              <section className="border-t border-zinc-100 pt-8 space-y-5">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Admin Controls</h3>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Status</label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className="w-full border-b border-zinc-200 py-2 text-sm bg-transparent focus:outline-none focus:border-black"
                  >
                    {Object.entries(STATUS_LABEL).map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Carrier</label>
                    <select
                      value={carrierDraft}
                      onChange={(e) => setCarrierDraft(e.target.value)}
                      className="w-full border-b border-zinc-200 py-2 text-sm bg-transparent focus:outline-none focus:border-black"
                    >
                      <option value="">선택</option>
                      {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Tracking #</label>
                    <input
                      value={trackingDraft}
                      onChange={(e) => setTrackingDraft(e.target.value)}
                      className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black"
                      placeholder="운송장 번호"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Admin note</label>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={3}
                    className="w-full border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                    placeholder="내부 메모"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className="px-6 py-2 text-[11px] uppercase tracking-[0.2em] bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-1">{label}</p>
      <p className="text-sm text-zinc-800 break-words">{value || '-'}</p>
    </div>
  );
}
