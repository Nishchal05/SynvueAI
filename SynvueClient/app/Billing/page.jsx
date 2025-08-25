"use client";

import { useState, useEffect, useContext } from "react";
import Sidebar from "../_component/Sidebar"
import { DollarSign, Zap, Crown, Gift, Sparkles, Loader2, XCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { DataContext } from "../DataProvider";
async function createOrderId(amount, coins,off,email) {
  try {
    const response = await axios.post("/api/createOrder", {
      amount: amount*100,
      currency: "INR",
      coins: coins,
      offer: off,
      email:email
    });
    console.log("Order Response:", response.data);
    return response.data.orderId;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw new Error("Failed to create order. Please try again.");
  }
}
function useKeyFromApi() {
  const [key, setKey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const response = await axios.get('/api/get-razorpay-key');
        setKey(response.data.key);
      } catch (e) {
        console.error("Failed to fetch Razorpay key:", e);
        setError("Failed to fetch payment key.");
      }
    };
    fetchKey();
  }, []);
  return { key, error };
}
const PurchaseButton = ({ price, coins, onPaymentSuccess, onPaymentError, isRazorpayLoaded, off,email,name}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { key, error: keyError } = useKeyFromApi();
  const handlePayment = async () => {
    setIsLoading(true);
    if (!key) {
      onPaymentError(keyError || "Payment key not available. Please refresh.");
      setIsLoading(false);
      return;
    }
    try {
      const orderId = await createOrderId(price, coins,off,email);
      const options = {
        key: key,
        amount: price * 100,
        currency: "INR",
        name: "SynvueAI",
        description: `${coins} Synvue Coins`,
        order_id: orderId,
        handler: function(response) {
          onPaymentSuccess({
            razorpay_order_id: orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            email:email
          });
        },
        prefill: {
          name: name,
          email: email,
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      onPaymentError("Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !isRazorpayLoaded}
      className="w-full cursor-pointer bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-300 hover:bg-blue-700 text-gray-600 font-extrabold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg text-lg flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : isRazorpayLoaded ? (
        `Buy ${coins} Coins Now`
      ) : (
        `Loading payment gateway...`
      )}
    </button>
  );
};
const MessageModal = ({ message, type, onClose }) => {
  if (!message) return null;
  const icon = type === 'success' ? <CheckCircle className="h-8 w-8 text-green-500" /> : <XCircle className="h-8 w-8 text-red-500" />;
  const title = type === 'success' ? 'Payment Successful!' : 'Payment Failed';
  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className={`p-8 rounded-lg shadow-xl max-w-sm w-full text-center ${bgColor}`}>
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="bg-gray-800 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main component, assuming Sidebar and other components exist
export default function BuyCredits() {
  const [coins, setCoins] = useState(1);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const pricePerCoin = 2;
  const INR_TO_USD_RATE = 87.50;
  const user=useUser();
  const convertInrToUsd = (inrAmount) => {
    if (typeof inrAmount !== 'number' || inrAmount < 0) return 'N/A';
    return (inrAmount / INR_TO_USD_RATE).toFixed(2);
  };

  const totalPriceINR = (coins * pricePerCoin).toFixed(2);
  const totalPriceUSD = convertInrToUsd(parseFloat(totalPriceINR));

  const offers = [
    {
      coins: 5,
      originalPricePerCoin: 2,
      priceINR: 8,
      discount: "₹2/coin",
      label: "Starter",
      icon: <Sparkles className="h-6 w-6 text-yellow-600" />,
    },
    {
      coins: 15,
      originalPricePerCoin: 2,
      priceINR: 25,
      discount: "16% OFF",
      label: "Pro",
      icon: <Zap className="h-6 w-6 text-purple-600" />,
    },
    {
      coins: 45,
      originalPricePerCoin: 2,
      priceINR: 74,
      discount: "16% OFF",
      label: "Advanced",
      icon: <Crown className="h-6 w-6 text-green-600" />,
    },
    {
      coins: 100,
      originalPricePerCoin: 2,
      priceINR: 160,
      bonus: "+10 Coins Free!",
      discount: "20% OFF",
      label:"Galaxy",
      icon: <Gift className="h-6 w-6 text-blue-600" />,
    },
  ];

  useEffect(() => {
    setCoins(1);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setIsRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK.");
      setIsRazorpayLoaded(false);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
const {minutes,setminutes}=useContext(DataContext);
const partner=useUser();
const handlePaymentSuccess = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature,email }) => {
    try {
      const res = await axios.post("/api/verifyOrder", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });
      if (res.data.success) {
        console.log( coins+minutes,email);
        await axios.put("/api/createuser", {
          minutes:coins+minutes,
          email:partner.user?.primaryEmailAddress?.emailAddress
        });
        setMessage(`Payment successful! Your payment ID is: ${razorpay_payment_id}. Coins added: ${coins}`);
        setMessageType('success');
        if (partner.user?.primaryEmailAddress?.emailAddress) {
          userdata();
        }
      } else {
        setMessage("Payment verification failed. Please contact support.");
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage("Error verifying payment. Please contact support.");
      setMessageType('error');
    }
  };  
  const handlePaymentError = (errorMsg) => {
    setMessage(errorMsg);
    setMessageType('error');
  };
  const userdata = async () => {
    if (!partner.user?.primaryEmailAddress?.emailAddress) return;
    try {
      const response = await fetch(
        `/api/createuser?email=${partner.user?.primaryEmailAddress?.emailAddress}`
      );
      const result = await response.json();
      setminutes(result?.user?.minutes || 7);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    if (partner.user?.primaryEmailAddress?.emailAddress) {
      userdata();
    }
  }, [partner.user]);
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Sidebar />
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
            <span className="text-gray-500 text-base ml-2">(${convertInrToUsd(pricePerCoin)})</span>
          </p>
          <p className="text-center text-green-600 text-sm font-medium mb-10">
            ✨ Your purchased credits never expire.
          </p>
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 max-w-lg mx-auto mb-16 border bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Custom Purchase</h2>
            <label htmlFor="coins-input" className="block text-md font-semibold mb-2 text-gray-700">
              Enter number of Coins you need:
            </label>
            <input
              id="coins-input"
              type="number"
              min="1"
              value={coins}
              onChange={(e) => setCoins(Number(e.target.value) || 0)}
              className="w-full p-4 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 mb-6 text-xl text-center font-bold"
              placeholder="e.g., 10"
            />
            <div className="flex justify-between items-center mb-6">
              <p className="text-xl md:text-2xl font-bold text-blue-900">Total Price:</p>
              <p className="text-xl md:text-2xl font-bold text-blue-900">
                ₹{totalPriceINR} <span className="text-gray-500 text-lg ml-1">(${totalPriceUSD})</span>
              </p>
            </div>
            <PurchaseButton
              price={parseFloat(totalPriceINR)}
              coins={coins}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              isRazorpayLoaded={isRazorpayLoaded}
              email={user.user?.primaryEmailAddress?.emailAddress}
              name={user?.user?.fullName}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((offer, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 border border-blue-300 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
              >
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
                <div className="mb-3">{offer.icon}</div>
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
                {offer.discount && (
                  <p className="text-sm text-blue-600 mt-1 font-semibold">{offer.discount}</p>
                )}
                <PurchaseButton
                  price={offer.priceINR}
                  coins={offer.coins}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  isRazorpayLoaded={isRazorpayLoaded}
                  off={offer.label}
                  email={user.user?.primaryEmailAddress?.emailAddress}
                  name={user?.user?.fullName}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <MessageModal
        message={message}
        type={messageType}
        onClose={() => setMessage(null)}
      />
    </div>
  );
}
