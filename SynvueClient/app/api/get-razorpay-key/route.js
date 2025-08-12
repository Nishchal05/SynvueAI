
import { NextResponse } from 'next/server';
export async function GET() {
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!razorpayKey) {
    console.error("Razorpay key environment variable is not set!");
    return NextResponse.json({ message: "Razorpay key is not configured on the server." }, { status: 500 });
  }
  return NextResponse.json({ key: razorpayKey }, { status: 200 });
}
