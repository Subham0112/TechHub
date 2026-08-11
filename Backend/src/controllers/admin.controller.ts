import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { orderToClient, productToClient } from "./products.controller";

interface DaySalesRow {
  day: string;
  revenue: number;
  orders: number;
}

interface TopProductRow {
  _id: string;
  name: string;
  image: string;
  unitsSold: number;
  revenue: number;
}

interface CustomerRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
}

const getStats = async (req: Request, res: Response) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 90);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const prevStart = new Date(startDate);
    prevStart.setDate(prevStart.getDate() - days);

    const [totalOrders, totalProducts, totalCustomers, orders, lowStockProducts] =
      await Promise.all([
        prisma.order.count(),
        prisma.product.count(),
        prisma.user.count({ where: { role: "user" } }),
        prisma.order.findMany({
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: {
              include: { product: { select: { id: true, name: true, image: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.product.findMany({
          where: { stock: { lte: 5 } },
          orderBy: { stock: "asc" },
          take: 8,
        }),
      ]);

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

    const salesByDayRaw = await prisma.$queryRaw<DaySalesRow[]>`
      SELECT to_char("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
             SUM("totalPrice")::float8 AS revenue,
             COUNT(*)::int AS orders
      FROM "Order"
      WHERE "orderStatus" <> 'cancelled' AND "createdAt" >= ${startDate}
      GROUP BY day
      ORDER BY day
    `;

    const previousRevenueRows = await prisma.$queryRaw<{ prevRevenue: number }[]>`
      SELECT COALESCE(SUM("totalPrice"), 0)::float8 AS "prevRevenue"
      FROM "Order"
      WHERE "orderStatus" <> 'cancelled' AND "createdAt" >= ${prevStart} AND "createdAt" < ${startDate}
    `;
    const previousPeriodRevenue = previousRevenueRows[0]?.prevRevenue ?? 0;

    const salesByDay: { date: string; label: string; revenue: number; orders: number }[] =
      [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().split("T")[0];
      const match = salesByDayRaw.find((s) => s.day === key);
      salesByDay.push({
        date: key,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0,
      });
    }

    const topProducts = await prisma.$queryRaw<TopProductRow[]>`
      SELECT COALESCE(p.id::text, 'deleted') AS _id,
             COALESCE(p.name, 'Deleted product') AS name,
             COALESCE(p.image, '') AS image,
             SUM(oi.quantity)::int AS "unitsSold",
             SUM(oi.subtotal)::float8 AS revenue
      FROM "OrderItem" oi
      JOIN "Order" o ON oi."orderId" = o.id
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE o."orderStatus" <> 'cancelled'
      GROUP BY p.id
      ORDER BY "unitsSold" DESC
      LIMIT 5
    `;

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
      salesByDay,
      previousPeriodRevenue,
      recentOrders: orders.slice(0, 6).map(orderToClient),
      topProducts,
      lowStockProducts: lowStockProducts.map(productToClient),
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.$queryRaw<CustomerRow[]>`
      SELECT u.id::text AS _id,
             u.name,
             u.email,
             u.phone,
             u.address,
             u."createdAt",
             COUNT(o.id)::int AS "orderCount",
             COALESCE(SUM(o."totalPrice")::float8, 0) AS "totalSpent"
      FROM "User" u
      LEFT JOIN "Order" o ON o."userId" = u.id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY u."createdAt" DESC
    `;

    res.status(200).json(customers);
  } catch (error) {
    console.error("Error getting customers:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export { getStats, getCustomers };
