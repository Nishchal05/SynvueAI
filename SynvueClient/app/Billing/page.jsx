"use client";
import { useState } from "react";
import Sidebar from "../_component/Sidebar";

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
    <div className="flex min-h-screen bg-blue-50 text-blue-900">
      <Sidebar />
      <div className="flex-1 px-4 sm:px-8 py-10 mt-11">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-3">Buy Synvue Coins</h1>
          <p className="text-center text-lg mb-1">1 Coin = ₹4.5 = 1 Minute</p>
          <p className="text-center text-green-600 text-sm font-medium mb-10">✨ Credits never expire</p>

          {/* Custom Buy Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-lg mx-auto mb-12 border border-blue-200">
            <label className="block text-sm font-semibold mb-2">Enter Coins</label>
            <input
              type="number"
              min="1"
              value={coins}
              onChange={(e) => setCoins(Number(e.target.value))}
              className="w-full p-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <p className="text-lg font-semibold mb-2">Total: ₹{totalPrice}</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200">
              Buy {coins || ""} Coins
            </button>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:ml-44">
            {offers.map((offer, idx) => (
              <div
                key={idx}
                className="bg-white border border-blue-300 rounded-xl shadow-md p-6 hover:shadow-xl transition-all flex flex-col items-center text-center"
              >
                <h2 className="text-2xl font-bold text-blue-700">{offer.coins} Coins</h2>
                {offer.label && (
                  <span className="mt-1 text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                    {offer.label}
                  </span>
                )}
                <p className="mt-1 text-gray-500">{offer.coins} Minutes</p>
                {offer.bonus && (
                  <p className="mt-1 text-sm text-green-600 font-medium">{offer.bonus}</p>
                )}
                <p className="text-2xl mt-4 font-bold text-blue-900">₹{offer.price}</p>
                <p className="text-sm text-blue-600 mt-1 font-medium">{offer.discount}</p>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md w-full transition duration-200">
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
