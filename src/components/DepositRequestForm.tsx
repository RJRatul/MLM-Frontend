/* eslint-disable @typescript-eslint/no-explicit-any */
// components/DepositRequestForm.tsx
"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { FaDollarSign, FaReceipt, FaPaperPlane, FaTimes } from "react-icons/fa";
import { apiService } from "@/services/api";
import Image from "next/image";

export default function DepositRequestForm() {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const amountNum = parseFloat(amount);
      if (amountNum <= 0) {
        setMessage({ type: "error", text: "Amount must be greater than 0" });
        return;
      }

      await apiService.createDeposit({ amount: amountNum, transactionId });

      setMessage({
        type: "success",
        text: "Deposit request submitted successfully!",
      });
      setAmount("");
      setTransactionId("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to submit deposit request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-white mb-6">Request Deposit</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500 text-green-500"
                : "bg-red-500/10 border border-red-500 text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}
        <div className="cursor-pointer" onClick={() => setShowImageModal(true)}>
          <Image
            src="/binanceQR.png"
            alt="BeeCoin Logo"
            width={80}
            height={40}
            className="object-contain hover:opacity-80 transition-opacity"
            priority
          />
        </div>
        <p className="text-gray-300 my-4 text-lg font-extrabold">
          Please send your deposit to the above Binance Pay QR code. And fill the
          below form with the exact amount and the transaction ID you receive
          after the payment.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Amount (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaDollarSign className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="transactionId"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Transaction ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaReceipt className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="transactionId"
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="Enter transaction ID"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            icon={<FaPaperPlane />}
            className="w-full"
          >
            Submit Deposit Request
          </Button>
        </form>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Binance Pay QR Code</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <Image
                src="/binanceQR.png"
                alt="Binance Pay QR Code - Enlarged"
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            </div>
            <div className="p-4 border-t border-gray-700">
              <Button
                onClick={() => setShowImageModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}