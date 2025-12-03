import { NextResponse } from 'next/server';
import { PortOneClient } from "@portone/server-sdk";

export async function POST(request) {
  const { paymentId } = await request.json();

  const apiSecret = 'Omnq1RYdFCasF8Y2T40shFHcIx3xicvkxsvJVrbSpRCgFbdxzxoijoVsnROC7K2YFNL8ut0WWEABy759';

  try {
    const portoneClient = new PortOneClient({
      apiSecret,
    });

    const payment = await portoneClient.payments.get(paymentId);

    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    // In a real application, you would also verify the amount against your order database.
    // For example: const order = await getOrderFromDB(orderId); if (order.amount !== payment.totalAmount) { ... }

    if (payment.status === 'PAID') {
      return NextResponse.json({ status: 'success', message: 'Payment successful', payment });
    } else {
      return NextResponse.json({ status: 'failed', message: `Payment status: ${payment.status}` }, { status: 400 });
    }

  } catch (error) {
    console.error('PortOne verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
