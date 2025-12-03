'use client';

import dynamic from 'next/dynamic';

const CheckoutClientPage = dynamic(() => import('./checkout-client-page'), { ssr: false });

const CheckoutPage = () => {
  return <CheckoutClientPage />;
};

export default CheckoutPage;


  