import { useCart } from '../../shared/context/cart-context';
import * as PortOne from '@portone/browser-sdk/v2';
import { Anton } from 'next/font/google';

const anton = Anton({ subsets: ['latin'], weight: ['400'] });

const CheckoutClientPage = () => {
  const { cart } = useCart();

  const totalAmount = cart.reduce((acc, item) => acc + parseFloat(item.price.replace(',', '')) * item.quantity, 0);

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
    <div className="bg-white text-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className={`${anton.className} text-4xl md:text-5xl font-semibold text-center mb-12 tracking-tighter`}>Checkout</h1>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="border border-zinc-200 p-6">
            <h2 className={`${anton.className} text-3xl font-bold tracking-tight mb-6`}>Order Summary</h2>
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">{item.name} x {item.quantity}</p>
                    <p className="text-zinc-500">{item.price}</p>
                  </div>
                  <span className="font-bold text-lg">${(parseFloat(item.price.replace(',', '')) * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <hr className="my-6 border-zinc-300" />
            <div className="flex justify-between items-center">
              <h3 className={`${anton.className} text-2xl font-bold tracking-tight`}>Total</h3>
              <p className={`${anton.className} text-2xl font-bold tracking-tight`}>${totalAmount.toFixed(2)}</p>
            </div>
          </div>
          <div className="border border-zinc-200 p-6">
            <h2 className={`${anton.className} text-3xl font-bold tracking-tight mb-6`}>Payment</h2>
            <div className="space-y-4">
              <button
                onClick={() => handlePayment('YOUR_CARD_CHANNEL_KEY', 'CARD')}
                className="w-full bg-zinc-900 text-white py-4 text-xl font-bold tracking-wider hover:bg-zinc-800 transition-colors"
              >
                PAY WITH CARD
              </button>
              <button
                onClick={() => handlePayment('YOUR_NAVER_PAY_CHANNEL_KEY', 'NAVERPAY')}
                className="w-full bg-green-500 text-white py-4 text-xl font-bold tracking-wider hover:bg-green-600 transition-colors"
              >
                PAY WITH NAVER PAY
              </button>
              <button
                onClick={() => handlePayment('channel-key-cfe68a62-6ac7-4cf8-97eb-e264b4bfe3c0', 'KAKAOPAY')}
                className="w-full bg-yellow-400 text-black py-4 text-xl font-bold tracking-wider hover:bg-yellow-500 transition-colors"
              >
                PAY WITH KAKAO PAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutClientPage;
