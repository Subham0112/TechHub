import { Request, Response } from "express";
import Order from "../models/productOrder.model";
import Product from "../models/products.model";
import User from "../models/users.model";

interface DaySales {
  _id: string;
  revenue: number;
  orders: number;
}

interface TopProductRow {
  _id: string;
  unitsSold: number;
  revenue: number;
  product?: { name: string; image?: string };
}

interface CustomerRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
}

const getStats = async (req: Request, res: Response) => {
  try {
    const [totalOrders, totalProducts, totalCustomers, orders, lowStockProducts] =
      await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        User.countDocuments({ role: "user" }),
        Order.find()
          .populate("userId", "name email")
          .populate("items.productId", "name image")
          .sort({ createdAt: -1 }),
        Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(8),
      ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
      return acc;
    }, {});

    const delivered = orders.filter((o) => o.orderStatus === "delivered");
    const paidNotCancelled = orders.filter(
      (o) => o.orderStatus !== "cancelled" && o.paymentStatus === "paid"
    );

    const totalRevenue = paidNotCancelled.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const deliveredRevenue = delivered.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pendingRevenue = orders
      .filter((o) => o.orderStatus !== "cancelled" && o.paymentStatus === "unpaid")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const salesByDayRaw = (await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" }, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])) as DaySales[];

    const last7Days: { date: string; label: string; revenue: number; orders: number }[] =
      [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().split("T")[0];
      const match = salesByDayRaw.find((s) => s._id === key);
      last7Days.push({
        date: key,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0,
      });
    }

    const topProductsRaw = (await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          unitsSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$product.name", "Deleted product"] },
          image: "$product.image",
          unitsSold: 1,
          revenue: 1,
        },
      },
    ])) as TopProductRow[];

    const topProducts = topProductsRaw.map((p) => ({
      _id: p._id,
      name: p.product?.name || "Deleted product",
      image: p.product?.image || "",
      unitsSold: p.unitsSold,
      revenue: p.revenue,
    }));

    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    res.status(200).json({
      totalRevenue,
      deliveredRevenue,
      pendingRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      averageOrderValue,
      statusCounts,
      salesByDay: last7Days,
      recentOrders: orders.slice(0, 6),
      topProducts,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = (await User.aggregate([
      { $match: { role: "user" } },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          address: 1,
          createdAt: 1,
          orderCount: { $size: "$orders" },
          totalSpent: { $sum: "$orders.totalPrice" },
        },
      },
      { $sort: { createdAt: -1 } },
    ])) as CustomerRow[];

    res.status(200).json(customers);
  } catch (error) {
    console.error("Error getting customers:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export { getStats, getCustomers };
