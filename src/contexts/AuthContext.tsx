/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/AuthContext.tsx - Updated with better error handling
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthResponse, apiService } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    referralCode?: string
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  refreshBalance: () => Promise<number>;
  refreshProfitData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New method to refresh profit data with better error handling
  const refreshProfitData = async (): Promise<void> => {
    try {
      const profitStats = await apiService.getProfitStats();
      setUser(prevUser => {
        if (prevUser) {
          return {
            ...prevUser,
            algoProfitAmount: profitStats.data.algoProfitAmount || 0,
            algoProfitPercentage: profitStats.data.algoProfitPercentage || 0,
            lastProfitCalculation: profitStats.data.lastProfitCalculation
          };
        }
        return prevUser;
      });
    } catch (error: any) {
      console.warn("Failed to refresh profit data:", error.message);
      // Set default profit data if API fails
      setUser(prevUser => {
        if (prevUser) {
          return {
            ...prevUser,
            algoProfitAmount: prevUser.algoProfitAmount || 0,
            algoProfitPercentage: prevUser.algoProfitPercentage || 0,
          };
        }
        return prevUser;
      });
    }
  };

  const refreshBalance = async (): Promise<number> => {
    try {
      const response = await apiService.getBalance();
      const newBalance = response.balance;
      
      setUser(prevUser => {
        if (prevUser) {
          const updatedUser = { ...prevUser, balance: newBalance };
          return updatedUser;
        }
        return prevUser;
      });
      
      return newBalance;
    } catch (error) {
      console.error("Failed to refresh balance:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getProfile();
      
      // Try to get profit stats, but don't fail if it doesn't work
      let profitData = {
        algoProfitAmount: 0,
        algoProfitPercentage: 0,
        lastProfitCalculation: undefined as string | undefined
      };
      
      try {
        const profitStats = await apiService.getProfitStats();
        profitData = {
          algoProfitAmount: profitStats.data.algoProfitAmount,
          algoProfitPercentage: profitStats.data.algoProfitPercentage,
          lastProfitCalculation: profitStats.data.lastProfitCalculation
        };
      } catch (profitError) {
        console.warn("Could not fetch profit stats:", profitError);
      }
      
      const updatedUser = {
        ...userData,
        ...profitData
      };
      
      setUser(updatedUser);
      // Only store basic user info
      const { balance, algoProfitAmount, algoProfitPercentage, lastProfitCalculation, ...userWithoutSensitiveData } = updatedUser;
      localStorage.setItem("user", JSON.stringify(userWithoutSensitiveData));
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in on initial load
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      
      // Parse user but don't trust the balance/profit from localStorage
      const parsedUser = JSON.parse(storedUser);
      
      // Fetch fresh data from server
      refreshBalance().then(freshBalance => {
        setUser({
          ...parsedUser,
          balance: freshBalance,
          algoProfitAmount: parsedUser.algoProfitAmount || 0,
          algoProfitPercentage: parsedUser.algoProfitPercentage || 0,
        });
        
        // Try to refresh profit data in background
        refreshProfitData().catch(() => {
          // Silently fail for profit data
        });
      }).catch(error => {
        console.error("Failed to fetch fresh balance:", error);
        setUser(parsedUser); // Fallback to stored user
      });
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiService.login({ email, password });

      // Store token and basic user data
      localStorage.setItem("authToken", data.token);
      const { balance, algoProfitAmount, algoProfitPercentage, lastProfitCalculation, ...userWithoutSensitiveData } = data.user;
      localStorage.setItem("user", JSON.stringify(userWithoutSensitiveData));

      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    referralCode?: string
  ) => {
    try {
      const data = await apiService.register({
        firstName,
        lastName,
        email,
        password,
        referralCode,
      });

      // Store token and basic user data
      localStorage.setItem("authToken", data.token);
      const { balance, algoProfitAmount, algoProfitPercentage, lastProfitCalculation, ...userWithoutSensitiveData } = data.user;
      localStorage.setItem("user", JSON.stringify(userWithoutSensitiveData));

      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
        refreshUser,
        refreshBalance,
        refreshProfitData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};