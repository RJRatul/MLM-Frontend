// app/register/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react"; // Added useEffect
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import AuthGuard from "@/components/AuthGuard";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaSignInAlt,
  FaGift, // Added for referral icon
} from "react-icons/fa";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    referralCode: "", // New field
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams(); // For getting referral code from URL
  const { register } = useAuth();

  // Pre-fill referral code from URL if present
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.referralCode || undefined // Pass referral code if provided
      );
      router.push("/trade");
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex flex-col justify-start md:justify-center items-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        
        {/* Back button */}
        <div className="w-full max-w-md mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-purple-400 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Logo and heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Create your BeeCoin account
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Join the next generation AI-powered trading platform
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Registration form */}
          <div className="bg-gray-800/70 backdrop-blur-sm py-8 px-6 rounded-2xl border border-gray-700/50">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    First name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white sm:text-sm"
                      placeholder="First name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Last name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white sm:text-sm"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white sm:text-sm"
                    placeholder="Create a secure password"
                  />
                </div>
              </div>

              {/* New Referral Code Field */}
              <div>
                <label
                  htmlFor="referralCode"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGift className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white sm:text-sm"
                    placeholder="Enter referral code if you have one"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Get bonus when you sign up with a referral code
                </p>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  isLoading={isLoading}
                  icon={<FaUserPlus />}
                  size="lg"
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  href="/login"
                  variant="secondary"
                  icon={<FaSignInAlt />}
                  size="lg"
                  className="w-full"
                >
                  Sign in instead
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}