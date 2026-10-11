import { Request, Response } from "express";
import { prisma } from "../config/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactRow = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const toClient = (row: ContactRow) => ({
  id: row.id,
  _id: String(row.id),
  name: row.name,
  email: row.email,
  subject: row.subject,
  message: row.message,
  isRead: row.isRead,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const createContactMessage = async (req: Request, res: Response) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim();
    const subject = String(req.body?.subject ?? "").trim();
    const message = String(req.body?.message ?? "").trim();

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: "Name must be between 2 and 100 characters" });
    }
    if (!EMAIL_RE.test(email) || email.length > 200) {
      return res.status(400).json({ message: "A valid email address is required" });
    }
    if (subject.length < 2 || subject.length > 150) {
      return res.status(400).json({ message: "Subject must be between 2 and 150 characters" });
    }
    if (message.length < 5 || message.length > 2000) {
      return res.status(400).json({ message: "Message must be between 5 and 2000 characters" });
    }

    const created = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    res.status(201).json({
      message: "Thanks! Your message has been sent — we'll get back to you soon.",
      id: created.id,
    });
  } catch (error) {
    console.error("Error creating contact message:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getContactMessages = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const take = 50;
    const unreadOnly = req.query.unread === "true";

    const where = unreadOnly ? { isRead: false } : {};

    const [messages, unread, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take,
      }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.contactMessage.count(),
    ]);

    res.status(200).json({
      messages: messages.map(toClient),
      unread,
      total,
      page,
      hasMore: messages.length === take,
    });
  } catch (error) {
    console.error("Error getting contact messages:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const markContactMessage = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Message not found" });
    }
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Message not found" });
    }

    const isRead =
      typeof req.body?.isRead === "boolean" ? req.body.isRead : !existing.isRead;
    const updated = await prisma.contactMessage.update({ where: { id }, data: { isRead } });
    res.status(200).json(toClient(updated));
  } catch (error) {
    console.error("Error updating contact message:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const deleteContactMessage = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Message not found" });
    }
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Message not found" });
    }

    await prisma.contactMessage.delete({ where: { id } });
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export {
  createContactMessage,
  getContactMessages,
  markContactMessage,
  deleteContactMessage,
};
