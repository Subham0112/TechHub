import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
const p = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
const admin = await p.user.findUnique({
   where: { email: "admin@gmail.com" } 
  });
const products = await p.product.findMany({
   select: { id: true } 
  });
const ids: number[] = [];
for (const [ago, amount] of [
  [1, 2500],
  [3, 4200],
  [5, 1800],
  [8, 9000],
  [12, 3300],
  [18, 6500],
  [25, 11000],
  [29, 4800],
] as const) {
  const d = new Date();
  d.setDate(d.getDate() - ago);
  const o = await p.order.create({
    data: {
      userId: admin!.id,
      totalPrice: amount,
      shippingAddress: "Demo",
      paymentMethod: "cod",
      orderStatus: "delivered",
      paymentStatus: "paid",
      createdAt: d,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: amount,
            subtotal: amount,
          },
        ],
      },
    },
  });
  ids.push(o.id);
}
console.log("demo order ids:", JSON.stringify(ids));
await p.$disconnect();
