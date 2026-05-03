import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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
    const res= await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`);
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