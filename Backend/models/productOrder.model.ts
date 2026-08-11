import { Schema, model, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrder {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  shippingAddress: string;
  orderStatus:
    | "pending"
    | "accepted"
    | "preparing"
    | "on the way"
    | "delivered"
    | "cancelled";
  paymentMethod: "esewa" | "khalti" | "cod";
  paymentStatus: "paid" | "unpaid";
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "accepted", "preparing", "on the way", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export default model<IOrder>("Order", orderSchema);
