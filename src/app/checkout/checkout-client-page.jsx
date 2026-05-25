import { useCart } from '../../shared/context/cart-context';
import * as PortOne from '@portone/browser-sdk/v2';

const CheckoutClientPage = () => {
  const { cart } = useCart();

  const getItemPrice = (item) => {
    if (item.priceNum) return item.priceNum;
    if (!item.price) return 0;
    return parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
  };

  const totalAmount = cart.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0);

  const formatKRW = (amount) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);

  const orderName =
    cart.length === 0
      ? 'CAGE3000 주문'
      : cart.length === 1
      ? `CAGE3000 ${cart[0].name}`
      : `CAGE3000 ${cart[0].name} 외 ${cart.length - 1}건`;

  const handlePayment = async (channelKey, payMethod) => {
    try {
      const response = await PortOne.requestPayment({
        storeId: 'store-f8c690bd-4758-457b-bb63-45d0d5a9a1d7',
        channelKey: channelKey,
        orderName: orderName,
        totalAmount: totalAmount,
        currency: 'KRW',
        payMethod: payMethod,
        redirectUrl: `${window.location.origin}/checkout/success`,
        customer: {
          fullName: '주문자',
          phoneNumber: '010-0000-0000',
          email: 'customer@example.com',
        },
      });

      if (response.code === 'PORTONE_PAYMENT_SUCCESS') {
        const verificationResponse = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transactionId: response.transactionId, orderId: response.orderId }),
        });

        const verificationData = await verificationResponse.json();

        if (verificationResponse.ok) {
          window.location.href = '/checkout/success';
        } else {
          alert(`결제 검증 실패: ${verificationData.message}`);
        }
      } else {
        alert(`결제 실패: ${response.message}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('결제 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-lg">
        <h1 className="font-serif text-3xl md:text-4xl text-center mb-16 text-black uppercase">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Order Summary */}
          <div>
            <h2 className="font-serif text-xl text-black mb-8 border-b border-zinc-200 pb-4">주문 내역</h2>
            <ul className="space-y-6">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-black font-medium">{item.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">수량: {item.quantity}</p>
                  </div>
                  <span className="text-xs tracking-widest text-zinc-600">
                    {formatKRW(getItemPrice(item) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-zinc-200 pt-6 flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-widest text-black font-bold">합계</h3>
              <p className="font-serif text-xl text-black">{formatKRW(totalAmount)}</p>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="font-serif text-xl text-black mb-8 border-b border-zinc-200 pb-4">결제 수단</h2>
            <div className="space-y-4">
              <button
                onClick={() => handlePayment('YOUR_CARD_CHANNEL_KEY', 'CARD')}
                className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
              >
                신용카드 결제
              </button>
              <button
                onClick={() => handlePayment('YOUR_NAVER_PAY_CHANNEL_KEY', 'NAVERPAY')}
                className="w-full bg-[#03C75A] text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#02b350] transition-colors"
              >
                네이버페이
              </button>
              <button
                onClick={() => handlePayment('channel-key-cfe68a62-6ac7-4cf8-97eb-e264b4bfe3c0', 'KAKAOPAY')}
                className="w-full bg-[#FEE500] text-black py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#e6cf00] transition-colors"
              >
                카카오페이
              </button>
            </div>
            <p className="mt-6 text-[10px] text-zinc-400 text-center leading-relaxed">
              결제 진행 시 <a href="/terms" className="underline hover:text-black transition-colors">이용약관</a> 및{' '}
              <a href="/privacy" className="underline hover:text-black transition-colors">개인정보처리방침</a>에 동의한 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutClientPage;

