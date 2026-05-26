'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as PortOne from '@portone/browser-sdk/v2';
import DaumPostcode from 'react-daum-postcode';
import { useCart } from '../../shared/context/cart-context';
import { formatKrPhone, isValidKrPhone } from '@/lib/validation';

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '';
const CHANNEL_CARD = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_CARD || '';
const CHANNEL_KAKAO = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KAKAOPAY || '';
const CHANNEL_NAVER = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_NAVERPAY || '';

const CheckoutClientPage = () => {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { cart, clearCart } = useCart();

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/checkout');
    }
  }, [authStatus, router]);

  // Prefill from session profile once it loads.
  useEffect(() => {
    if (!session?.user) return;
    setRecipientName((prev) => prev || session.user.name || '');
    setRecipientPhone((prev) => prev || session.user.phoneNumber || '');
    setZipCode((prev) => prev || session.user.zipCode || '');
    setAddress((prev) => prev || session.user.address || '');
    setDetailAddress((prev) => prev || session.user.detailAddress || '');
  }, [session]);

  const getItemPrice = (item) => {
    if (item.priceNum) return item.priceNum;
    if (!item.price) return 0;
    return parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
  };

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0),
    [cart]
  );

  const formatKRW = (amount) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);

  const orderName =
    cart.length === 0
      ? 'CAGE3000 주문'
      : cart.length === 1
        ? `CAGE3000 ${cart[0].name}`
        : `CAGE3000 ${cart[0].name} 외 ${cart.length - 1}건`;

  const shippingValid =
    recipientName.trim().length >= 2 &&
    isValidKrPhone(recipientPhone) &&
    address.trim().length >= 4;

  const handleCompletePostcode = (data) => {
    setAddress(data.address);
    setZipCode(data.zonecode);
    setIsPostcodeOpen(false);
  };

  const handlePayment = async (channelKey, payMethod) => {
    setError('');
    if (cart.length === 0) {
      setError('장바구니가 비어 있습니다.');
      return;
    }
    if (!shippingValid) {
      setError('배송 정보를 모두 입력해 주세요.');
      return;
    }
    if (!STORE_ID || !channelKey) {
      setError('결제 채널이 설정되지 않았습니다. 관리자에게 문의해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // 1) Server-side draft order (authoritative pricing)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          shipping: {
            recipientName,
            recipientPhone,
            zipCode,
            address,
            detailAddress,
            customerNote,
          },
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error || '주문 생성에 실패했습니다.');
        return;
      }

      const { id: orderId, orderNumber, totalAmount } = orderData;

      // 2) PortOne payment with the server-issued orderNumber/totalAmount
      const response = await PortOne.requestPayment({
        storeId: STORE_ID,
        channelKey,
        paymentId: orderNumber,
        orderName,
        totalAmount,
        currency: 'KRW',
        payMethod,
        redirectUrl: `${window.location.origin}/checkout/success`,
        customer: {
          fullName: recipientName,
          phoneNumber: recipientPhone,
          email: session?.user?.email || undefined,
        },
        customData: { orderId },
      });

      if (response.code) {
        setError(`결제 실패: ${response.message || response.code}`);
        return;
      }

      // 3) Server-side verification + Order PAID transition
      const verifyRes = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: response.paymentId || orderNumber,
          orderId,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.status === 'success') {
        clearCart();
        window.location.href = `/checkout/success?order=${encodeURIComponent(orderNumber)}`;
      } else {
        setError(verifyData.message || '결제 검증에 실패했습니다.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('결제 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xs uppercase tracking-widest text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-lg">
        <h1 className="font-serif text-3xl md:text-4xl text-center mb-16 text-black uppercase">
          Checkout
        </h1>

        {error && (
          <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 py-3 mb-8">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Order Summary */}
          <div>
            <h2 className="font-serif text-xl text-black mb-8 border-b border-zinc-200 pb-4">
              주문 내역
            </h2>
            {cart.length === 0 ? (
              <p className="text-sm text-zinc-400">장바구니가 비어 있습니다.</p>
            ) : (
              <>
                <ul className="space-y-6">
                  {cart.map((item) => (
                    <li key={item.id} className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest text-black font-medium">
                          {item.name}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                          수량: {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs tracking-widest text-zinc-600">
                        {formatKRW(getItemPrice(item) * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t border-zinc-200 pt-6 flex justify-between items-center">
                  <h3 className="text-xs uppercase tracking-widest text-black font-bold">
                    합계
                  </h3>
                  <p className="font-serif text-xl text-black">{formatKRW(subtotal)}</p>
                </div>
              </>
            )}
          </div>

          {/* Shipping + Payment */}
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-xl text-black mb-8 border-b border-zinc-200 pb-4">
                배송 정보
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black"
                    placeholder="수령인"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                  <input
                    className="border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black"
                    placeholder="휴대폰 (010-1234-5678)"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(formatKrPhone(e.target.value))}
                    inputMode="numeric"
                    maxLength={13}
                  />
                </div>
                <div className="flex gap-3">
                  <input
                    className="w-28 border-b border-zinc-200 py-2 text-sm"
                    placeholder="우편번호"
                    value={zipCode}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setIsPostcodeOpen(true)}
                    className="bg-black text-white px-5 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800"
                  >
                    검색
                  </button>
                </div>
                <input
                  className="w-full border-b border-zinc-200 py-2 text-sm"
                  placeholder="주소"
                  value={address}
                  readOnly
                />
                <input
                  className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black"
                  placeholder="상세 주소"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                />
                <textarea
                  className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black resize-none"
                  placeholder="배송 메모 (선택)"
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl text-black mb-8 border-b border-zinc-200 pb-4">
                결제 수단
              </h2>
              <div className="space-y-4">
                <button
                  disabled={submitting || !shippingValid || cart.length === 0}
                  onClick={() => handlePayment(CHANNEL_CARD, 'CARD')}
                  className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
                >
                  신용카드 결제
                </button>
                <button
                  disabled={submitting || !shippingValid || cart.length === 0}
                  onClick={() => handlePayment(CHANNEL_NAVER, 'NAVERPAY')}
                  className="w-full bg-[#03C75A] text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#02b350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  네이버페이
                </button>
                <button
                  disabled={submitting || !shippingValid || cart.length === 0}
                  onClick={() => handlePayment(CHANNEL_KAKAO, 'KAKAOPAY')}
                  className="w-full bg-[#FEE500] text-black py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#e6cf00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  카카오페이
                </button>
              </div>
              <p className="mt-6 text-[10px] text-zinc-400 text-center leading-relaxed">
                결제 진행 시{' '}
                <a href="/terms" className="underline hover:text-black transition-colors">
                  이용약관
                </a>
                {' '}및{' '}
                <a href="/privacy" className="underline hover:text-black transition-colors">
                  개인정보처리방침
                </a>
                에 동의한 것으로 간주됩니다.
              </p>
            </div>
          </div>
        </div>

        {isPostcodeOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 w-full max-w-md relative">
              <button
                type="button"
                onClick={() => setIsPostcodeOpen(false)}
                className="absolute top-2 right-2 p-2 hover:bg-zinc-100 rounded-full"
              >
                ✕
              </button>
              <DaumPostcode onComplete={handleCompletePostcode} className="h-[400px]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutClientPage;
