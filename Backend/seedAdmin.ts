import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

import User from "./models/users.model";

const adminData = {
  name: process.env.ADMIN_NAME || "Admin User",
  phone: process.env.ADMIN_PHONE || "9999999999",
  email: process.env.ADMIN_EMAIL || "admin@gmail.com",
  password: process.env.ADMIN_PASSWORD || "admin123",
  address: process.env.ADMIN_ADDRESS || "Admin Address",
  role: "admin" as const,
};

const seedAdmin = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.DB_CONNECTION_STRING || "mongodb://127.0.0.1:27017/techhub";
    process.env.DB_CONNECTION_STRING = mongoUri;

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const existingUser = await User.findOne({
      $or: [{ email: adminData.email }, { phone: adminData.phone }],
    });

    if (existingUser) {
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      existingUser.name = adminData.name;
      existingUser.phone = adminData.phone;
      existingUser.email = adminData.email;
      existingUser.password = hashedPassword;
      existingUser.address = adminData.address;
      existingUser.role = "admin";

      await existingUser.save();
      console.log(`Admin updated successfully: ${existingUser.email}`);
    } else {
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      const newAdmin = await User.create({
        ...adminData,
        password: hashedPassword,
      });

      console.log(`Admin created successfully: ${newAdmin.email}`);
    }
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
