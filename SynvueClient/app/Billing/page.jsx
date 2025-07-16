"use client";
import { useState, useEffect } from "react";
import Sidebar from "../_component/Sidebar"; // Assuming this path is correct
import { DollarSign, Zap, Crown, Gift, Sparkles } from "lucide-react"; // Icons for flair

export default function BuyCredits() {
  const [coins, setCoins] = useState(1); 
  const pricePerCoin = 3.5;
  const INR_TO_USD_RATE = 85.50; 

  const convertInrToUsd = (inrAmount) => {
    if (typeof inrAmount !== 'number' || inrAmount < 0) return 'N/A';
    return (inrAmount / INR_TO_USD_RATE).toFixed(2); // Keep 2 decimal places for USD
  };

  const totalPriceINR = (coins * pricePerCoin).toFixed(2);
  const totalPriceUSD = convertInrToUsd(parseFloat(totalPriceINR)); // Ensure conversion after toFixed for consistency

  // Offers adjusted for the new price (approximated, adjust as per your actual pricing strategy)
  const offers = [
    {
      coins: 5,
      originalPricePerCoin: 3.5,
      priceINR: 17, // 5 * 3.5 = 17.5. Offer: 17 (approx ₹3.4/coin)
      label: "Starter Pack",
      icon: <Sparkles className="h-6 w-6 text-yellow-600" />,
      discount: "₹3.4/coin",
    },
    {
      coins: 15,
      originalPricePerCoin: 3.5,
      priceINR: 42, // 15 * 3.5 = 52.5. Offer: 50 (approx 5% off)
      discount: "20% OFF",
      icon: <Zap className="h-6 w-6 text-purple-600" />,
    },
    {
      coins: 45,
      originalPricePerCoin: 3.5,
      priceINR: 125, // 45 * 3.5 = 157.5. Offer: 150 (approx 5% off)
      discount: "20% OFF",
      icon: <Crown className="h-6 w-6 text-green-600" />,
    },
    {
      coins: 100,
      originalPricePerCoin: 3.5,
      priceINR: 290, // 100 * 3.5 = 350. Offer: 330 (approx 5.7% off)
      bonus: "+10 Coins Free!",
      discount: "25% OFF",
      icon: <Gift className="h-6 w-6 text-blue-600" />,
    },
  ];

  // Set initial coins to 1 when component mounts
  useEffect(() => {
    setCoins(1);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-900">
      <Sidebar />
      {/* Main content area - shifted to the right on medium+ screens */}
      <div className="flex-1 px-4 sm:px-8 py-10 pt-20 md:ml-[270px] transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-blue-700 mb-4 tracking-tight">
            Unlock Your Interview Potential
          </h1>
          <p className="text-center text-lg text-gray-700 mb-2">
            Purchase Synvue Coins for AI-powered mock interviews.
          </p>
          <p className="text-center text-xl font-semibold text-blue-600 mb-1">
            <DollarSign className="inline-block h-5 w-5 mr-1 align-text-bottom" />1 Coin = ₹{pricePerCoin} = 1 Minute
            <span className="text-gray-500 text-base ml-2">(${convertInrToUsd(pricePerCoin)})</span> {/* Dollar equivalent for base price */}
          </p>
          <p className="text-center text-green-600 text-sm font-medium mb-10">
            ✨ Your purchased credits never expire.
          </p>

          {/* Custom Buy Box */}
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 max-w-lg mx-auto mb-16 border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Custom Purchase</h2>
            <label htmlFor="coins-input" className="block text-md font-semibold mb-2 text-gray-700">
              Enter number of Coins you need:
            </label>
            <input
              id="coins-input"
              type="number"
              min="1"
              value={coins}
              onChange={(e) => setCoins(Number(e.target.value))}
              className="w-full p-4 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 mb-6 text-xl text-center font-bold"
              placeholder="e.g., 10"
            />
            <div className="flex justify-between items-center mb-6">
              <p className="text-xl md:text-2xl font-bold text-blue-900">Total Price:</p>
              <p className="text-xl md:text-2xl font-bold text-blue-900">
                ₹{totalPriceINR} <span className="text-gray-500 text-lg ml-1">(${totalPriceUSD})</span>
              </p>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg text-lg">
              Buy {coins > 0 ? `${coins} Coins` : "Coins"} Now
            </button>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((offer, idx) => (
              <div
                key={idx}
                className="bg-white border border-blue-300 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Optional: Add a 'best value' badge for certain offers */}
                {offer.discount && offer.discount.includes("% OFF") && (
                    <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {offer.discount}
                    </span>
                )}
                {offer.label === "Starter Pack" && (
                    <span className="absolute top-0 left-0 bg-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1 rounded-br-lg">
                        {offer.label}
                    </span>
                )}

                <div className="mb-3">{offer.icon}</div> {/* Icon for visual appeal */}
                <h2 className="text-3xl font-extrabold text-blue-800 mb-1">{offer.coins} Coins</h2>
                <p className="text-md text-gray-600 mb-2">{offer.coins} Minutes</p>
                {offer.bonus && (
                  <p className="text-sm text-green-600 font-bold mb-2">
                    {offer.bonus}
                  </p>
                )}

                <p className="text-4xl mt-4 font-extrabold text-blue-900">
                    ₹{offer.priceINR} <span className="text-gray-500 text-xl ml-1">(${convertInrToUsd(offer.priceINR)})</span>
                </p>
                {/* Display discounted price per coin if applicable for better comparison */}
                {offer.discount && (
                  <p className="text-sm text-blue-600 mt-1 font-semibold">{offer.discount}</p>
                )}
                <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-lg w-full transition duration-300 shadow-md hover:shadow-lg text-lg">
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