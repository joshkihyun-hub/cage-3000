'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function SuccessMessage() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(`Payment successful! Order ID: ${data.orderId}`);
        } else {
          setMessage(`Payment failed: ${data.message}`);
        }
      } catch (error) {
        setMessage('An error occurred while confirming the payment.');
        console.error(error);
      }
    };

    if (paymentKey && orderId && amount) {
      confirmPayment();
    }
  }, [paymentKey, orderId, amount]);

  return <p>{message}</p>;
}

const SuccessPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
      <Suspense fallback={<div>Processing payment...</div>}>
        <SuccessMessage />
      </Suspense>
    </div>
  );
};

export default SuccessPage;
