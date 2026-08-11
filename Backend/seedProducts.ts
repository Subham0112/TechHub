import dotenv from "dotenv";
import slugify from "slugify";
import { prisma } from "./src/config/prisma";

dotenv.config();

const productsData = [
  {
    name: "Wireless Earbuds Pro",
    price: 2499,
    description:
      "Premium wireless earbuds with active noise cancellation, 30-hour battery life, and a compact charging case.",
    category: "gadgets",
    type: "audio",
    stock: 50,
    image: "",
  },
  {
    name: "Samsung 25W Fast Charger",
    price: 1299,
    description:
      "Compact 25W USB-C fast charger with smart power delivery, safe for phones, tablets, and earbuds.",
    category: "mobile-accessories",
    type: "charger",
    stock: 30,
    image: "",
  },
  {
    name: "Tempered Glass Screen Protector",
    price: 299,
    description:
      "9H hardness tempered glass screen protector with oleophobic coating for scratch and fingerprint resistance.",
    category: "mobile-accessories",
    type: "screen-protector",
    stock: 100,
    image: "",
  },
  {
    name: "Smart Watch X1",
    price: 5499,
    description:
      "Feature-packed smartwatch with AMOLED display, heart-rate and sleep tracking, GPS, and 10-day battery life.",
    category: "gadgets",
    type: "smartwatch",
    stock: 20,
    image: "",
  },
  {
    name: "USB-C to Lightning Cable",
    price: 599,
    description:
      "Durable braided USB-C to Lightning cable with fast charging and data transfer support.",
    category: "mobile-accessories",
    type: "cable",
    stock: 75,
    image: "",
  },
];

const seedProducts = async (): Promise<void> => {
  try {
    for (const productData of productsData) {
      const slug = slugify(productData.name, { lower: true, strict: true });

      const existingProduct = await prisma.product.findFirst({
        where: { slug },
      });

      if (existingProduct) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name: productData.name,
            price: productData.price,
            description: productData.description,
            category: productData.category,
            type: productData.type,
            stock: productData.stock,
            image: productData.image,
          },
        });
        console.log(`Product updated successfully: ${productData.name}`);
      } else {
        await prisma.product.create({
          data: {
            ...productData,
            slug,
          },
        });
        console.log(`Product created successfully: ${productData.name}`);
      }
    }
  } catch (error) {
    console.error("Failed to seed products:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedProducts();
