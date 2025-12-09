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
    
    // Update user state
    setUser(userData);
    
    // Update localStorage with complete user data
    localStorage.setItem("user", JSON.stringify(userData));
    
    console.log('User refreshed:', {
      hasUserId: !!userData.userId,
      hasFirstName: !!userData.firstName,
      balance: userData.balance
    });
  } catch (error) {
    console.error("Failed to refresh user data:", error);
    // Don't throw error, just log it
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
    
    // Extract and store user data properly
    const userData: User = {
      id: data.user.id || data.user._id,
      _id: data.user._id,
      userId: data.user.userId || '',
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      balance: data.user.balance || 0,
      status: data.user.status || 'active',
      aiStatus: data.user.aiStatus || false,
      isAdmin: data.user.isAdmin || false,
      referralCode: data.user.referralCode || '',
      referralCount: data.user.referralCount || 0,
      referralEarnings: data.user.referralEarnings || 0,
      level: data.user.level || 0,
      tier: data.user.tier || 3,
      commissionUnlocked: data.user.commissionUnlocked || false,
      commissionRate: data.user.commissionRate || 0,
      algoProfitAmount: data.user.algoProfitAmount || 0,
      algoProfitPercentage: data.user.algoProfitPercentage || 0,
      lastProfitCalculation: data.user.lastProfitCalculation,
      createdAt: data.user.createdAt,
      updatedAt: data.user.updatedAt,
      transactions: data.user.transactions || []
    };
    
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
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
    
    // Extract and store user data properly
    const userData: User = {
      id: data.user.id || data.user._id,
      _id: data.user._id,
      userId: data.user.userId || '',
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      balance: data.user.balance || 0,
      status: data.user.status || 'active',
      aiStatus: data.user.aiStatus || false,
      isAdmin: data.user.isAdmin || false,
      referralCode: data.user.referralCode || '',
      referralCount: data.user.referralCount || 0,
      referralEarnings: data.user.referralEarnings || 0,
      level: data.user.level || 0,
      tier: data.user.tier || 3,
      commissionUnlocked: data.user.commissionUnlocked || false,
      commissionRate: data.user.commissionRate || 0,
      algoProfitAmount: data.user.algoProfitAmount || 0,
      algoProfitPercentage: data.user.algoProfitPercentage || 0,
      lastProfitCalculation: data.user.lastProfitCalculation,
      createdAt: data.user.createdAt,
      updatedAt: data.user.updatedAt,
      transactions: data.user.transactions || []
    };
    
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
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