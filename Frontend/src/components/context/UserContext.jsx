import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/profile`
        );
        setUser(res.data.user);
      } catch (err) {
  if (err.response?.status !== 401) {
    console.error(err);
  }
  setUser(null);

      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const saveUser = (userData) => {
    setUser(userData);
  };

 const logout = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`);
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