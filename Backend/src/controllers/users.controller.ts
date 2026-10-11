import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, timingSafeEqual } from "crypto";
import { validationResult } from "express-validator";
import { prisma } from "../config/prisma";

const ACCESS_TOKEN_TTL = "10m";
const ACCESS_TOKEN_MAX_AGE = 10 * 60 * 1000;
const USER_REFRESH_TOKEN_TTL = "1d";
const USER_REFRESH_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000;
const ADMIN_REFRESH_TOKEN_TTL = "7d";
const ADMIN_REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const tokensMatch = (a: string, b: string) => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
};

const setAccessCookie = (res: Response, token: string) =>
  res.cookie("accesstoken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

const setRefreshCookie = (res: Response, token: string, isAdmin: boolean) =>
  res.cookie("refreshtoken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: isAdmin ? ADMIN_REFRESH_TOKEN_MAX_AGE : USER_REFRESH_TOKEN_MAX_AGE,
  });

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
    const AccessToken = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    const RefreshToken = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: USER_REFRESH_TOKEN_TTL }
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshtoken: hashToken(RefreshToken) },
    })

    setAccessCookie(res, AccessToken);
    setRefreshCookie(res, RefreshToken, false);
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
    const AccessToken = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    const RefreshToken = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: ADMIN_REFRESH_TOKEN_TTL }
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshtoken: hashToken(RefreshToken) },
    });
    setAccessCookie(res, AccessToken);
    setRefreshCookie(res, RefreshToken, true);
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

const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshtoken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { userId: string; role: string; name: string };

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
    });

    if (!user || !user.refreshtoken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const isCurrent =
      tokensMatch(hashToken(refreshToken), user.refreshtoken) ||
      tokensMatch(refreshToken, user.refreshtoken);

    if (!isCurrent) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    setAccessCookie(res, newAccessToken);

    return res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
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
  try {
    if (req.user?.id) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshtoken: null },
      });
    }
  } catch (error) {
    console.error("Error revoking refresh token:", error);
  }
  res.clearCookie("accesstoken");
  res.clearCookie("refreshtoken");
  res.status(200).json({ message: "User logged out successfully" });
};

export { registerUser, loginUser, adminLogin, getUserProfile, updateProfile, refreshAccessToken, logoutUser };
