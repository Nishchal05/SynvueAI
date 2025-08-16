import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;
if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are missing");
}
const razorpay = new Razorpay({
    key_id,
    key_secret
});
const offersService = [
    {
      coins: 5,
      originalPricePerCoin: 3.5,
      priceINR: 1700,
      label: "Starter",
      discount: "₹3.4/coin",
    },
    {
      coins: 15,
      originalPricePerCoin: 3.5,
      priceINR: 4200,
      discount: "20% OFF",
      label: "Pro",
    },
    {
      coins: 45,
      originalPricePerCoin: 3.5,
      priceINR: 12500,
      discount: "20% OFF",
      label: "Advanced",
    },
    {
      coins: 100,
      originalPricePerCoin: 3.5,
      priceINR: 29000,
      bonus: "+10 Coins Free!",
      discount: "25% OFF",
      label:"Galaxy",
    },
  ];
export async function POST(request) {
    try {
        const { amount, currency, offer, email} = await request.json();
        if (!amount) {
            return NextResponse.json(
                { message: "Amount is required" },
                { status: 404 }
            );
        }
        let confirmation=false;
        if (offer) {
            confirmation = offersService.some(
              (val) => val.label === offer && val.priceINR === amount
            );
          } else if (amount) {
            const expectedAmount = amount;
            confirmation = Math.abs(expectedAmount - amount) < 0.01; 
          }
            if (!confirmation) {
            return NextResponse.json(
                { message: "something went wrong!!" },
                { status: 404 }
            );
        }
        const options = {
            amount,
            currency: currency || "INR",
            receipt: `receipt#${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        console.log("Order Created Successfully");
        return NextResponse.json({ orderId: order.id }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Server Error", error: error.message },
            { status: 500 }
        );
    }
}
