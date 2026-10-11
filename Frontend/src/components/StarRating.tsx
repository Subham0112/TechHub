import React from "react";
import { FiStar } from "react-icons/fi";

interface StarRatingProps {
  rating: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}

const StarRating = ({ rating, onChange, size = 14, className = "" }: StarRatingProps) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= Math.round(rating);
        const star = (
          <FiStar
            style={{ width: size, height: size }}
            className={filled ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}
            fill={filled ? "currentColor" : "none"}
          />
        );
        if (!onChange) return <span key={value}>{star}</span>;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className="transition hover:scale-110 cursor-pointer"
            aria-label={`${value} star${value !== 1 ? "s" : ""}`}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
