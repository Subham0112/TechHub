import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types";

interface UserContextValue {
  user: User | null;
  saveUser: (userData: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

export const UserContext = createContext<UserContextValue>({
  user: null,
  saveUser: () => {},
  logout: async () => {},
  loading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await axios.get<{ user: User }>(
          `${import.meta.env.VITE_API_URL}/users/profile`
        );
        setUser(res.data.user);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status !== 401) {
          console.error(err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const saveUser = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`);
      if (res.status === 200) {
        setUser(null);
        navigate("/login");
      } else {
        console.error("Logout failed:", res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, saveUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
