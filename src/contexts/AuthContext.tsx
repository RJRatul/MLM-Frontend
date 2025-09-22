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
    referralCode?: string // New optional parameter
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  refreshBalance: () => Promise<number>;
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

  useEffect(() => {
    // Check if user is logged in on initial load
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      
      // Parse user but don't trust the balance from localStorage
      const parsedUser = JSON.parse(storedUser);
      
      // Fetch fresh balance from server
      refreshBalance().then(freshBalance => {
        setUser({
          ...parsedUser,
          balance: freshBalance
        });
      }).catch(error => {
        console.error("Failed to fetch fresh balance:", error);
        setUser(parsedUser); // Fallback to stored user
      });
    }

    setIsLoading(false);
  }, []);

const refreshBalance = async (): Promise<number> => {
  try {
    const response = await apiService.getBalance();
    const newBalance = response.balance;
    
    // Update the user state with the new balance
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
      setUser(userData);
      // Only store basic user info, don't rely on balance in localStorage
      const { balance, ...userWithoutBalance } = userData;
      localStorage.setItem("user", JSON.stringify(userWithoutBalance));
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await apiService.login({ email, password });

      // Store token and basic user data (without balance)
      localStorage.setItem("authToken", data.token);
      const { balance, ...userWithoutBalance } = data.user;
      localStorage.setItem("user", JSON.stringify(userWithoutBalance));

      setToken(data.token);
      setUser(data.user); // But keep full user data in state
    } catch (error) {
      throw error;
    }
  };

const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  referralCode?: string // Add optional parameter
) => {
  try {
    const data = await apiService.register({
      firstName,
      lastName,
      email,
      password,
      referralCode, // Pass referral code to API
    });

    // Store token and basic user data (without balance)
    localStorage.setItem("authToken", data.token);
    const { balance, ...userWithoutBalance } = data.user;
    localStorage.setItem("user", JSON.stringify(userWithoutBalance));

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
        refreshBalance, // Add this new method
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};