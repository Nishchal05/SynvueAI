"use client";
import { useState } from "react";

export default function BuyCredits() {
  const [coins, setCoins] = useState(0);
  const pricePerCoin = 4.5;
  const totalPrice = (coins * pricePerCoin).toFixed(2);

  const offers = [
    {
      coins: 5,
      price: 23,
      label: "Starter Pack",
      discount: "₹4.6/coin",
    },
    {
      coins: 15,
      price: 55,
      discount: "18% OFF",
    },
    {
      coins: 45,
      price: 165,
      discount: "18% OFF",
    },
    {
      coins: 100,
      price: 370,
      bonus: "+10 Coins Free",
      discount: "17% OFF",
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4 flex flex-col items-center text-blue-900">
      <h1 className="text-4xl font-bold mb-4 text-center text-blue-700">Buy Synvue Coins</h1>
      <p className="mb-2 text-lg text-center">1 Coin = ₹4.5 = 1 Minute</p>
      <p className="mb-8 text-sm text-green-600 font-medium text-center">✨ Credits never expire</p>

      {/* Custom Buy Section */}
      <div className="bg-white shadow-xl border border-blue-300 rounded-lg p-6 w-full max-w-md mb-10">
        <label className="block text-sm font-semibold mb-2">Enter Coins</label>
        <input
          type="number"
          min="1"
          value={coins}
          onChange={(e) => setCoins(Number(e.target.value))}
          className="w-full p-3 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <p className="text-lg font-semibold">Total: ₹{totalPrice}</p>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full transition">
          Buy {coins} Coins
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {offers.map((offer, idx) => (
          <div
            key={idx}
            className="bg-white border border-blue-400 shadow-md rounded-xl p-6 flex flex-col items-center text-center hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-bold text-blue-700">{offer.coins} Coins</h2>
            {offer.label && (
              <span className="text-sm mt-1 px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 font-medium">
                {offer.label}
              </span>
            )}
            <p className="mt-1 text-gray-600">{offer.coins} Minutes</p>
            {offer.bonus && (
              <p className="mt-1 text-sm text-green-600 font-medium">{offer.bonus}</p>
            )}
            <p className="text-xl mt-4 font-bold text-blue-900">₹{offer.price}</p>
            <p className="text-sm text-blue-600 mt-1">{offer.discount}</p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition w-full">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
