'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function FailMessage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const code = searchParams.get('code');

  return (
    <div>
      <p><strong>Error Code:</strong> {code}</p>
      <p><strong>Error Message:</strong> {message}</p>
    </div>
  );
}

const FailPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-red-500">Payment Failed</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <FailMessage />
      </Suspense>
    </div>
  );
};

export default FailPage;
