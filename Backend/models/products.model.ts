import { Schema, model } from "mongoose";

export interface IProduct {
  name: string;
  price: number;
  description: string;
  slug: string;
  image?: string;
  category: "mobile-accessories" | "gadgets" | string;
  type: string;
  stock: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      index: true,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: ["mobile-accessories", "gadgets"],
      default: "mobile-accessories",
    },
    type: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export default model<IProduct>("Product", productSchema);
