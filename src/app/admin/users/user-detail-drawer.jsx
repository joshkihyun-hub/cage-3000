'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

function formatDateTime(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('ko-KR');
  } catch {
    return '-';
  }
}

function formatKRW(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

const STATUS_LABELS = {
  active: '활성',
  suspended: '정지',
  withdrawn: '탈퇴',
};

const ORDER_STATUS_LABELS = {
  pending: '결제 대기',
  paid: '결제 완료',
  preparing: '제작 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소',
  refunded: '환불',
  failed: '실패',
};

export default function UserDetailDrawer({ userId, onClose, onUpdated, currentAdminId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [statusDraft, setStatusDraft] = useState('active');
  const [roleDraft, setRoleDraft] = useState('user');
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    if (!userId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/admin/users/${userId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('조회 실패');
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setDetail(json);
        setStatusDraft(json.user.status);
        setRoleDraft(json.user.role);
        setNoteDraft(json.user.adminNote || '');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ESC to close
  useEffect(() => {
    if (!userId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [userId, onClose]);

  const handleSave = async () => {
    if (!detail) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        status: statusDraft,
        role: roleDraft,
        adminNote: noteDraft,
      };
      const res = await fetch(`/api/admin/users/${detail.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '저장 실패');
      setDetail((prev) => ({
        ...prev,
        user: { ...prev.user, ...json.user },
      }));
      onUpdated?.(json.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!userId) return null;

  const isSelf = detail?.user?.id === currentAdminId;
  const dirty =
    detail &&
    (statusDraft !== detail.user.status ||
      roleDraft !== detail.user.role ||
      (noteDraft || '') !== (detail.user.adminNote || ''));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-zinc-100 z-10 flex items-center justify-between px-8 py-5">
          <h2 className="font-serif text-lg uppercase tracking-wide">
            Customer Detail
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-8 space-y-10">
          {loading && (
            <p className="text-xs uppercase tracking-widest text-zinc-400">Loading...</p>
          )}
          {error && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-100 py-2 px-3">
              {error}
            </p>
          )}

          {detail && !loading && (
            <>
              {/* Identity */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">
                  Identity
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <Field label="Name" value={detail.user.name} />
                  <Field label="Email" value={detail.user.email} />
                  <Field label="Phone" value={detail.user.phoneNumber} />
                  <Field
                    label="Address"
                    value={
                      detail.user.address
                        ? `(${detail.user.zipCode || ''}) ${detail.user.address} ${detail.user.detailAddress || ''}`
                        : '-'
                    }
                  />
                  <Field label="Joined" value={formatDateTime(detail.user.createdAt)} />
                  <Field label="Last login" value={formatDateTime(detail.user.lastLoginAt)} />
                  <Field label="Login count" value={detail.user.loginCount} />
                  <Field
                    label="Marketing"
                    value={detail.user.marketingConsent ? 'Opted-in' : 'Opted-out'}
                  />
                  <Field
                    label="Terms agreed"
                    value={formatDateTime(detail.user.termsAgreedAt)}
                  />
                  <Field
                    label="Privacy agreed"
                    value={formatDateTime(detail.user.privacyAgreedAt)}
                  />
                </div>
              </section>

              {/* Stats */}
              <section className="grid grid-cols-2 gap-4">
                <div className="border border-zinc-100 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">
                    Lifetime orders
                  </p>
                  <p className="font-serif text-2xl">{detail.stats.lifetimeOrders}</p>
                </div>
                <div className="border border-zinc-100 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">
                    Lifetime revenue
                  </p>
                  <p className="font-serif text-2xl">
                    {formatKRW(detail.stats.lifetimeRevenue)}
                  </p>
                </div>
              </section>

              {/* Admin controls */}
              <section className="border-t border-zinc-100 pt-8">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">
                  Admin Controls
                </h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
                      Status
                    </label>
                    <select
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      className="w-full border-b border-zinc-200 py-2 text-sm bg-transparent focus:outline-none focus:border-black"
                    >
                      {Object.entries(STATUS_LABELS).map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
                      Role
                    </label>
                    <select
                      value={roleDraft}
                      onChange={(e) => setRoleDraft(e.target.value)}
                      disabled={isSelf}
                      className="w-full border-b border-zinc-200 py-2 text-sm bg-transparent focus:outline-none focus:border-black disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    {isSelf && (
                      <p className="text-[10px] text-zinc-400 mt-2">
                        본인의 권한은 변경할 수 없습니다.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    Admin note
                  </label>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={3}
                    className="w-full border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
                    placeholder="내부 메모 (예: 단골 고객, VIP 응대 필요 등)"
                  />
                </div>
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className="px-6 py-2 text-[11px] uppercase tracking-[0.2em] bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </section>

              {/* Orders */}
              <section className="border-t border-zinc-100 pt-8">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-4">
                  Order History ({detail.user.orders.length})
                </h3>
                {detail.user.orders.length === 0 ? (
                  <p className="text-xs text-zinc-400">아직 주문 내역이 없습니다.</p>
                ) : (
                  <ul className="space-y-4">
                    {detail.user.orders.map((order) => (
                      <li
                        key={order.id}
                        className="border border-zinc-100 px-4 py-3 text-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-mono text-xs text-zinc-500">
                              {order.orderNumber}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1">
                              {formatDateTime(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-serif text-base">
                              {formatKRW(order.totalAmount)}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </p>
                          </div>
                        </div>
                        <ul className="text-xs text-zinc-500 space-y-1 mt-2">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>
                                {item.productName} × {item.quantity}
                              </span>
                              <span>{formatKRW(item.subtotal)}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
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
