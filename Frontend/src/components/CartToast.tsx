import React, { useContext } from "react";
import { CartContext } from "./context/CartContext";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const CartToast: React.FC = () => {
  const context = useContext(CartContext);
  const toast = context?.toast ?? null;

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl
      border backdrop-blur-sm animate-slide-up transition-all duration-300
      bg-slate-800/90 text-white ${
        isSuccess ? "border-green-500/40" : "border-red-500/40"
      }`}
    >
      {isSuccess ? (
        <FiCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
      ) : (
        <FiXCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
};

export default CartToast;
