import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { prisma } from "../config/prisma";

const registerUser = async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ errors: validationResult(req).array() });
  }

  const { name, phone, email, password, address } = req.body as {
    name: string;
    phone: string;
    email: string;
    password: string;
    address: string;
  };

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email)
        return res.status(400).json({ error: "Email already exists" });

      if (existingUser.phone === phone)
        return res.status(400).json({ error: "Phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        address,
        // role automatically becomes 'user'
      },
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

const loginUser = async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ errors: validationResult(req).array() });
  }
  const { email, password } = req.body as { email: string; password: string };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ errors: "Invalid Email or Password" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ errors: "Invalid Email or  Password" });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    console.log("User logged in successfully:", user.id);
    return res.status(200).json({
      user: {
        id: String(user.id),
        _id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ errors: "Server error, please try again later" });
  }
};

const adminLogin = async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ errors: validationResult(req).array() });
  }
  const { email, password } = req.body as { email: string; password: string };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ errors: "Invalid Email or Password" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ errors: "Invalid Email or Password" });
    }
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({
          errors:
            "This account is not authorized for admin access. Please use the customer login instead.",
        });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    console.log("Admin logged in successfully:", user.id);
    return res.status(200).json({
      user: {
        id: String(user.id),
        _id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    return res.status(500).json({ errors: "Server error, please try again later" });
  }
};

const getUserProfile = async (req: Request, res: Response) => {
  const user = req.user;
  res.status(200).json({
    user: user ? { ...user, id: String(user.id), _id: String(user.id) } : user,
  });
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address } = req.body as {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    const user = await prisma.user.update({
      where: { id: req.user?.id },
      data: { name, email, phone, address },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(200).json({
      user: { ...user, id: String(user.id), _id: String(user.id) },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully" });
};

export { registerUser, loginUser, adminLogin, getUserProfile, updateProfile, logoutUser };
