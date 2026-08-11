import bcrypt from "bcrypt";
import dotenv from "dotenv";
import {prisma} from "./src/config/prisma";

dotenv.config();


const adminData = {
  name: process.env.ADMIN_NAME || "Admin",
  phone: process.env.ADMIN_PHONE || "9999999999",
  email: process.env.ADMIN_EMAIL || "admin@gmail.com",
  password: process.env.ADMIN_PASSWORD || "admin123",
  address: process.env.ADMIN_ADDRESS || "Admin Address",
  role: "admin",
};
const seedAdmin = async (): Promise<void> => {
  try {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: adminData.email }, { phone: adminData.phone }],
      },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: adminData.name,
          phone: adminData.phone,
          email: adminData.email,
          password: hashedPassword,
          address: adminData.address,
          role: "admin",
        },
      });
      console.log(`Admin updated successfully: ${existingUser.email}`);
    } else {
      const newAdmin = await prisma.user.create({
        data: {
          ...adminData,
          password: hashedPassword,
        },
      });
      console.log(`Admin created successfully: ${newAdmin.email}`);
    }
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();
