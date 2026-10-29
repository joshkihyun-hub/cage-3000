'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import * as PortOne from '@portone/browser-sdk/v2';
import DaumPostcode from 'react-daum-postcode';
import { BUY_NOW_FLAG, useCart } from '../../shared/context/cart-context';
import { items as catalog, isPurchasable } from '@/shared/constants/shop-items';
import { formatKrPhone, isValidEmail, isValidKrPhone } from '@/lib/validation';
import { ESCROW_NOTICE, KCP_TRANSFER_ENABLED } from '@/lib/escrow';
import { CHANNEL_KCP, EASY_PAY_OPTIONS } from '@/lib/payment-methods';
import { Block } from '@/components/block';

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '';

const inputClass =
  'w-full border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none';

const CheckoutClientPage = () => {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { cart: bag, clearCart } = useCart();
  // 상품 상세의 Buy Now는 /checkout?buy=<id>로 온다 — 그 한 점만 결제하고 장바구니는 그대로 둔다.
  // 이 컴포넌트는 브라우저에서만 그려진다(page.jsx의 ssr: false) — window를 바로 읽어도 된다.
  // 판매하지 않거나 가격이 아직 없는 피스는 주소로 들어와도 결제 화면에 올리지 않는다(₩0으로 보였다) —
  // 그럴 땐 장바구니로 바꿔치기하지 않고 빈 주문으로 둔다.
  const [buyNow] = useState(() => {
    const id = new URLSearchParams(window.location.search).get('buy');
    if (!id) return null;
    const item = catalog.find((entry) => String(entry.id) === id);
    return { item: item && isPurchasable(item) ? item : null };
  });
  const buyNowItem = buyNow?.item ?? null;
  const cart = useMemo(
    () => (buyNow ? (buyNowItem ? [{ ...buyNowItem, quantity: 1 }] : []) : bag),
    [buyNow, buyNowItem, bag]
  );

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

  // easyPay는 EASY_PAY_OPTIONS의 한 항목 — 카드 결제면 비어 있다.
  const handlePayment = async (payMethod, easyPay) => {
    setError('');
    const channelKey = easyPay ? easyPay.channelKey : CHANNEL_KCP;
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
    if (!STORE_ID || !channelKey) {
      setError('결제 채널이 설정되지 않았습니다. 관리자에게 문의해 주세요.');
      return;
    }

    setSubmitting(true);
    // 결제 완료 화면이 장바구니를 비울지 정하는 표시. 모바일 결제는 PG 화면을 거쳐
    // /checkout/success로 돌아오므로 같은 탭에 남는 sessionStorage로 넘긴다. 지난번
    // Buy Now 표시가 남아 일반 결제의 장바구니가 안 비워지는 일이 없게 매번 새로 쓴다.
    try {
      if (buyNowItem) window.sessionStorage.setItem(BUY_NOW_FLAG, '1');
      else window.sessionStorage.removeItem(BUY_NOW_FLAG);
    } catch {
      // 저장소를 못 쓰면 결제 완료 화면이 장바구니를 비울 뿐 — 결제에는 영향 없음.
    }
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

      const { id: orderId, orderNumber, totalAmount, items: orderItems = [] } = orderData;

      // 2) PortOne payment with the server-issued orderNumber/totalAmount.
      // 결제 수단마다 채널이 다르다. KCP 채널의 EASY_PAY는 easyPayProvider를 반드시 함께 보내야 하고,
      // 직접 계약 채널(카카오페이·네이버페이·토스페이)은 그 값을 무시한다.
      const response = await PortOne.requestPayment({
        storeId: STORE_ID,
        channelKey,
        paymentId: orderNumber,
        orderName,
        totalAmount,
        currency: 'KRW',
        payMethod,
        ...(easyPay ? { easyPay: { easyPayProvider: easyPay.provider } } : {}),
        // 네이버페이 직접 채널은 상품 정보를 여기로 받는다(일반 상품 = PRODUCT/GENERAL).
        ...(easyPay?.direct && easyPay.provider === 'NAVERPAY'
          ? {
              bypass: {
                naverpay: {
                  productItems: cart.map((item) => ({
                    categoryType: 'PRODUCT',
                    categoryId: 'GENERAL',
                    uid: String(item.id),
                    name: `CAGE3000 ${item.name}`,
                    count: item.quantity,
                  })),
                },
              },
            }
          : {}),
        // 계좌이체는 에스크로(구매안전서비스)로만 받는다 — KCP 에스크로 계약이 있어야 승인된다.
        // 상품 정보는 서버가 정한 가격 그대로 보내고, 결제창에 현금영수증 신청란을 띄운다.
        // 예상 배송 소요일은 제작 4–6영업일 + 배송 1–3영업일의 끝인 9일.
        ...(payMethod === 'TRANSFER'
          ? {
              isEscrow: true,
              products: orderItems.map((item) => ({
                id: item.productId,
                name: `CAGE3000 ${item.productName}`,
                amount: item.unitPrice,
                quantity: item.quantity,
              })),
              bypass: {
                kcp_v2: {
                  shop_user_id: session?.user?.id || orderNumber,
                  disp_tax_yn: 'Y',
                  deli_term: '09',
                },
              },
            }
          : {}),
        redirectUrl: `${window.location.origin}/checkout/success`,
        customer: {
          fullName: recipientName,
          phoneNumber: recipientPhone,
          email: session?.user?.email || guestEmail || undefined,
        },
        customData: { orderId },
      });

      // 결제사가 준 오류 문구는 고치지 않고 그대로 보여 준다(네이버페이는 이게 계약 조건이다).
      if (response.code) {
        setError(response.message || `결제가 완료되지 않았습니다. (${response.code})`);
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

      // 결제 확인 뒤 완료 화면은 전체 이동으로 띄운다(의도된 동작이라 린트 경고만 끈다).
      if (verifyRes.ok && verifyData.status === 'success') {
        if (!buyNowItem) clearCart();
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/checkout/success?order=${encodeURIComponent(orderNumber)}`;
      } else if (verifyData.status === 'processing') {
        // PG가 아직 승인을 마무리 중 — 웹훅이 서버에서 정산하므로 실패가 아니다.
        // 소프트 접수 화면으로 보낸다.
        if (!buyNowItem) clearCart();
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
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
                href={`/auth/signin?callbackUrl=${encodeURIComponent(
                  buyNowItem ? `/checkout?buy=${buyNowItem.id}` : '/checkout'
                )}`}
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

            {/* 채널이 연결된 수단만 보인다 — 계약 전 수단은 눌러도 결제창에서 오류가 나기 때문. */}
            {CHANNEL_KCP && (
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
            )}
            {/* 계좌이체 — KCP 에스크로 승인 뒤 스위치(KCP_TRANSFER_ENABLED)를 켰을 때만. */}
            {CHANNEL_KCP && KCP_TRANSFER_ENABLED && (
              <Block>
                <button
                  disabled={payDisabled}
                  data-sound="firm"
                  onClick={() => handlePayment('TRANSFER')}
                  className="text-sm md:text-base hover:underline disabled:text-zinc-400 disabled:cursor-not-allowed disabled:no-underline"
                >
                  계좌이체 →
                </button>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{ESCROW_NOTICE}</p>
              </Block>
            )}
            {EASY_PAY_OPTIONS.length > 0 && (
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
            )}

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

        {/* 간편결제 선택 — 채널이 연결된 수단(EASY_PAY_OPTIONS)만 나온다. */}
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
                  {EASY_PAY_OPTIONS.map((option) => (
                    <button
                      key={option.provider}
                      disabled={submitting}
                      data-sound="firm"
                      onClick={() => {
                        setIsEasyPayOpen(false);
                        handlePayment('EASY_PAY', option);
                      }}
                      className="block text-sm md:text-base hover:underline disabled:text-zinc-400"
                    >
                      {option.label} →
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
