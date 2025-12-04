import { useCart } from '../../shared/context/cart-context';
import * as PortOne from '@portone/browser-sdk/v2';

const CheckoutClientPage = () => {
  const { cart } = useCart();

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  };

  const totalAmount = cart.reduce((acc, item) => acc + parsePrice(item.price) * item.quantity, 0);

  const handlePayment = async (channelKey, payMethod) => {
    try {
      const response = await PortOne.requestPayment({
        storeId: 'store-f8c690bd-4758-457b-bb63-45d0d5a9a1d7',
        channelKey: channelKey,
        orderName: 'Example Order',
        totalAmount: totalAmount,
        currency: 'KRW',
        payMethod: payMethod,
        redirectUrl: `${window.location.origin}/checkout/success`,
        customer: {
          fullName: 'John Doe',
          phoneNumber: '010-1234-5678',
          email: 'test@example.com',
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
          alert('Payment successful and verified!');
          window.location.href = '/checkout/success';
        } else {
          alert(`Payment verification failed: ${verificationData.message}`);
        }
      } else {
        alert(`Payment failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred during payment.');
    }
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-lg">
        <h1 className="font-serif text-3xl md:text-4xl text-center mb-16 text-black uppercase">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Order Summary */}
          <div>
            <h2 className="font-serif text-xl text-black mb-8 border-b border-zinc-200 pb-4">Order Summary</h2>
            <ul className="space-y-6">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-black font-medium">{item.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs tracking-widest text-zinc-600">${(parsePrice(item.price) * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-zinc-200 pt-6 flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-widest text-black font-bold">Total</h3>
              <p className="font-serif text-xl text-black">${totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="font-serif text-xl text-black mb-8 border-b border-zinc-200 pb-4">Payment</h2>
            <div className="space-y-4">
              <button
                onClick={() => handlePayment('YOUR_CARD_CHANNEL_KEY', 'CARD')}
                className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
              >
                Pay with Card
              </button>
              <button
                onClick={() => handlePayment('YOUR_NAVER_PAY_CHANNEL_KEY', 'NAVERPAY')}
                className="w-full bg-[#03C75A] text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#02b350] transition-colors"
              >
                Pay with Naver Pay
              </button>
              <button
                onClick={() => handlePayment('channel-key-cfe68a62-6ac7-4cf8-97eb-e264b4bfe3c0', 'KAKAOPAY')}
                className="w-full bg-[#FEE500] text-black py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#e6cf00] transition-colors"
              >
                Pay with Kakao Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutClientPage;
