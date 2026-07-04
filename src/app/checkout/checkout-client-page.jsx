'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import * as PortOne from '@portone/browser-sdk/v2';
import DaumPostcode from 'react-daum-postcode';
import { useCart } from '../../shared/context/cart-context';
import { formatKrPhone, isValidEmail, isValidKrPhone } from '@/lib/validation';
import { Block } from '@/components/block';

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '';
// 단일 KCP V2 채널로 카드 + 간편결제(KakaoPay/NaverPay/TossPay/...) 모두 처리.
// 환경에 따라 테스트연동/실연동 채널 키를 환경변수로 주입한다.
const CHANNEL_KCP = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KCP || '';

const inputClass =
  'w-full border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none';

const CheckoutClientPage = () => {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { cart, clearCart } = useCart();

  const isAuthed = authStatus === 'authenticated';
  const isGuest = authStatus === 'unauthenticated';

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [isEasyPayOpen, setIsEasyPayOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // 전자상거래법: 주문제작 상품의 청약철회 제한은 "사전 고지 + 동의"가 있어야 유효.
  const [agreedMadeToOrder, setAgreedMadeToOrder] = useState(false);

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
    address.trim().length >= 4 &&
    (isAuthed || isValidEmail(guestEmail));

  const handleCompletePostcode = (data) => {
    setAddress(data.address);
    setZipCode(data.zonecode);
    setIsPostcodeOpen(false);
  };

  const handlePayment = async (payMethod, easyPayProvider) => {
    setError('');
    if (cart.length === 0) {
      setError('장바구니가 비어 있습니다.');
      return;
    }
    if (!shippingValid) {
      setError(
        isGuest && !isValidEmail(guestEmail)
          ? '이메일과 배송 정보를 모두 입력해 주세요.'
          : '배송 정보를 모두 입력해 주세요.'
      );
      return;
    }
    if (!agreedMadeToOrder) {
      setError('주문 제작 상품의 환불 제한 안내에 동의해 주세요.');
      return;
    }
    if (!STORE_ID || !CHANNEL_KCP) {
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
          guestEmail: isAuthed ? undefined : guestEmail.trim().toLowerCase(),
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

      // 2) PortOne payment with the server-issued orderNumber/totalAmount.
      // 단일 KCP V2 채널 — payMethod로 카드/간편결제를 분기한다.
      // EASY_PAY는 KCP V2에서 easyPayProvider를 반드시 함께 보내야 동작한다.
      const response = await PortOne.requestPayment({
        storeId: STORE_ID,
        channelKey: CHANNEL_KCP,
        paymentId: orderNumber,
        orderName,
        totalAmount,
        currency: 'KRW',
        payMethod,
        ...(payMethod === 'EASY_PAY' && easyPayProvider
          ? { easyPay: { easyPayProvider } }
          : {}),
        redirectUrl: `${window.location.origin}/checkout/success`,
        customer: {
          fullName: recipientName,
          phoneNumber: recipientPhone,
          email: session?.user?.email || guestEmail || undefined,
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
      } else if (verifyData.status === 'processing') {
        // PG가 아직 승인을 마무리 중 — 웹훅이 서버에서 정산하므로 실패가 아니다.
        // 소프트 접수 화면으로 보낸다.
        clearCart();
        window.location.href = `/checkout/success?order=${encodeURIComponent(orderNumber)}&soft=1`;
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

  const payDisabled = submitting || !shippingValid || cart.length === 0 || !agreedMadeToOrder;

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-lg">

        <Block>
          <h1 className="text-base md:text-lg">Checkout</h1>
          {/* Guest banner — login is optional; users can complete checkout with an email only. */}
          {isGuest && (
            <p className="text-sm text-zinc-700 mt-1">
              이미 회원이신가요?{' '}
              <Link
                href="/auth/signin?callbackUrl=/checkout"
                className="underline hover:text-zinc-500"
              >
                로그인
              </Link>{' '}
              · 또는 비회원으로 계속 진행하세요.
            </p>
          )}
        </Block>

        {error && (
          <Block className="mt-3">
            <p className="text-sm text-red-600">{error}</p>
          </Block>
        )}

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-x-10 items-start">
          {/* Order Summary */}
          <div className="space-y-3">
            <Block>
              <p className="text-sm mb-3">주문 내역</p>
              {cart.length === 0 ? (
                <p className="text-sm text-zinc-500">장바구니가 비어 있습니다.</p>
              ) : (
                <>
                  <ul className="space-y-2">
                    {cart.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm text-zinc-700">
                        <span>
                          {item.name} <span className="text-zinc-400">× {item.quantity}</span>
                        </span>
                        <span>{formatKRW(getItemPrice(item) * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between text-sm md:text-base mt-4 pt-3 border-t border-zinc-200">
                    <span>합계</span>
                    <span>{formatKRW(subtotal)}</span>
                  </div>
                </>
              )}
            </Block>
          </div>

          {/* Shipping + Payment */}
          <div className="space-y-3">
            {/* Guest email — only when not signed in */}
            {isGuest && (
              <Block>
                <label htmlFor="guest-email" className="block text-sm mb-2">
                  Email
                </label>
                <input
                  id="guest-email"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  주문 확인 메일이 이 주소로 발송됩니다. 비회원 주문 조회 시에도 필요합니다.
                </p>
              </Block>
            )}

            <Block>
              <p className="text-sm mb-3">배송 정보</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    placeholder="수령인"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="휴대폰 (010-1234-5678)"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(formatKrPhone(e.target.value))}
                    inputMode="numeric"
                    maxLength={13}
                  />
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    className="w-28 border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none"
                    placeholder="우편번호"
                    value={zipCode}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setIsPostcodeOpen(true)}
                    className="text-sm hover:underline"
                  >
                    검색
                  </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="주소"
                  value={address}
                  readOnly
                />
                <input
                  className={inputClass}
                  placeholder="상세 주소"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                />
                <textarea
                  className={`${inputClass} resize-none`}
                  placeholder="배송 메모 (선택)"
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                />
              </div>
            </Block>

            <Block>
              <p className="text-sm mb-3">결제 수단</p>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedMadeToOrder}
                  onChange={(e) => setAgreedMadeToOrder(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-black"
                />
                <span className="text-xs text-zinc-600 leading-relaxed">
                  <span className="text-black font-medium">[필수]</span> 본 상품은 주문 제작(Made-to-Order)
                  상품으로, 결제 후 제작이 시작되면 단순 변심에 의한 청약철회·환불이 제한됨을 확인했습니다.{' '}
                  <a href="/refund" className="underline hover:text-black transition-colors">
                    환불 및 취소 정책
                  </a>
                </span>
              </label>
            </Block>

            <Block>
              <button
                disabled={payDisabled}
                data-sound="firm"
                onClick={() => handlePayment('CARD')}
                className="text-sm md:text-base hover:underline disabled:text-zinc-400 disabled:cursor-not-allowed disabled:no-underline"
              >
                {submitting ? '결제 진행 중…' : '신용카드로 결제 →'}
              </button>
            </Block>
            <Block>
              <button
                disabled={payDisabled}
                data-sound="firm"
                onClick={() => setIsEasyPayOpen(true)}
                className="text-sm md:text-base hover:underline disabled:text-zinc-400 disabled:cursor-not-allowed disabled:no-underline"
              >
                간편결제 →
              </button>
            </Block>

            <p className="text-xs text-zinc-400 leading-relaxed pl-3">
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

        {isPostcodeOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
            <div className="bg-white p-4 w-full max-w-md relative">
              <button
                type="button"
                onClick={() => setIsPostcodeOpen(false)}
                className="absolute top-2 right-2 p-2 hover:bg-zinc-100 rounded-full"
                aria-label="닫기"
              >
                ✕
              </button>
              <DaumPostcode onComplete={handleCompletePostcode} className="h-[400px]" />
            </div>
          </div>
        )}

        {/* Easy-pay provider selector. KCP V2 requires easyPayProvider to be
            specified when payMethod is EASY_PAY — the modal collects that
            choice before kicking off the PortOne flow. */}
        {isEasyPayOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
            onClick={() => setIsEasyPayOpen(false)}
          >
            <div
              className="bg-white w-full max-w-sm relative p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsEasyPayOpen(false)}
                className="absolute top-3 right-3 p-2 text-zinc-400 hover:text-black"
                aria-label="닫기"
              >
                ✕
              </button>
              <Block>
                <p className="text-sm mb-4">간편결제 선택</p>
                <div className="space-y-3">
                  {[
                    { label: '카카오페이', provider: 'KAKAOPAY' },
                    { label: '네이버페이', provider: 'NAVERPAY' },
                    { label: '토스페이', provider: 'TOSSPAY' },
                  ].map(({ label, provider }) => (
                    <button
                      key={provider}
                      disabled={submitting}
                      data-sound="firm"
                      onClick={() => {
                        setIsEasyPayOpen(false);
                        handlePayment('EASY_PAY', provider);
                      }}
                      className="block text-sm md:text-base hover:underline disabled:text-zinc-400"
                    >
                      {label} →
                    </button>
                  ))}
                </div>
              </Block>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutClientPage;
