/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import type { Offer } from "../../types";

interface OffersContextValue {
  offers: Offer[];
  offersLoading: boolean;
  refreshOffers: () => Promise<void>;
}

export const OffersContext = createContext<OffersContextValue | undefined>(undefined);

export const OffersProvider = ({ children }: { children: React.ReactNode }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);

  const refreshOffers = useCallback(async () => {
    try {
      const res = await axios.get<Offer[]>(`${import.meta.env.VITE_API_URL}/offers/active`);
      setOffers(res.data);
    } catch (err) {
      console.error("Offers fetch error:", err);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOffers();
  }, [refreshOffers]);

  return (
    <OffersContext.Provider value={{ offers, offersLoading, refreshOffers }}>
      {children}
    </OffersContext.Provider>
  );
};

export const useOffers = (): OffersContextValue => {
  const ctx = useContext(OffersContext);
  if (!ctx) throw new Error("useOffers must be used within OffersProvider");
  return ctx;
};
