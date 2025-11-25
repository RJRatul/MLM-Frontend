/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import {
  FaArrowLeft,
  FaSignInAlt,
  FaLock,
  FaEnvelope,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

// Hardcoded admin credentials (same as in AdminAuthGuard)
const ADMIN_CREDENTIALS = {
  email: "adminShanto@beecoin.com",
  password: "AdminSecurePass123#Mridul",
};

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // In your AdminLogin component - update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Check against hardcoded admin credentials
    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // Use the same hardcoded token that backend expects
      const authToken = "admin-hardcoded-token-12345";

      // Store with the correct key that the API service will look for
      localStorage.setItem("adminAuthToken", authToken);
      localStorage.setItem("adminAuthTime", new Date().getTime().toString());

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } else {
      setError("Invalid admin credentials. Access denied.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <FaShieldAlt className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="mt-2 text-sm text-gray-400">BeeCoin Trading System</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-4 px-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FaSignInAlt className="mr-2" /> Administrator Sign In
            </h2>
          </div>

          {/* Card Body */}
          <div className="p-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Administrator Email
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white sm:text-sm"
                    placeholder="Enter admin email"
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-gray-700/50 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white sm:text-sm"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  isLoading={isLoading}
                  icon={<FaSignInAlt />}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                >
                  {isLoading ? "Authenticating..." : "Access Admin Dashboard"}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-center">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Main Site
                </Link>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-900/50 py-3 px-6 text-center">
            <p className="text-xs text-gray-500">
              Secure access for authorized administrators only. All activities
              are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
