import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
  getRatingMap,
  getReviewStats,
  getSiteSummary,
  reviewToClient,
} from "../services/review.service";

const userSelect = { id: true, name: true, profilePic: true } as const;
const productSelect = { id: true, name: true, image: true, slug: true } as const;

const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId)) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const where: Record<string, unknown> = { productId };
    if (req.user?.id) {
      // Logged-in users also see their own review even while it is pending.
      where.OR = [{ status: "approved" }, { userId: req.user.id }];
    } else {
      where.status = "approved";
    }

    const [reviews, [summary]] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: userSelect } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      getRatingMap([productId]).then((m) => [m.get(productId) ?? { rating: 0, reviewCount: 0 }]),
    ]);

    res.status(200).json({
      summary,
      reviews: reviews.map(reviewToClient),
    });
  } catch (error) {
    console.error("Error getting product reviews:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const createReview = async (req: Request, res: Response) => {
  try {
    const rawProductId = req.body?.productId;
    const productId =
      rawProductId === undefined || rawProductId === null || rawProductId === ""
        ? null
        : Number(rawProductId);
    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment ?? "").trim();

    if (productId !== null && (!Number.isInteger(productId) || productId <= 0)) {
      return res.status(400).json({ message: "Valid product is required" });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (comment.length < 3 || comment.length > 1000) {
      return res.status(400).json({
        message: "Comment must be between 3 and 1000 characters",
      });
    }

    if (productId !== null) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    const userId = req.user?.id as number;
    const existing =
      productId === null
        ? await prisma.review.findFirst({ where: { productId: null, userId } })
        : await prisma.review.findUnique({
            where: { productId_userId: { productId, userId } },
          });

    const review = existing
      ? await prisma.review.update({
          where: { id: existing.id },
          data: { rating, comment, status: "pending" },
        })
      : await prisma.review.create({
          data: { productId, userId, rating, comment, status: "pending" },
        });

    res.status(existing ? 200 : 201).json(reviewToClient(review));
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getSiteReviews = async (req: Request, res: Response) => {
  try {
    const where: Record<string, unknown> = { productId: null };
    if (req.user?.id) {
      where.OR = [{ status: "approved" }, { userId: req.user.id }];
    } else {
      where.status = "approved";
    }

    const [reviews, summary] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: userSelect } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      getSiteSummary(),
    ]);

    res.status(200).json({
      summary,
      reviews: reviews.map(reviewToClient),
    });
  } catch (error) {
    console.error("Error getting site reviews:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getReviews = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const scope = req.query.scope as string | undefined;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const take = 50;
    const where: Record<string, unknown> =
      status && ["pending", "approved", "rejected"].includes(status) ? { status } : {};
    if (scope === "site") where.productId = null;
    if (scope === "product") where.productId = { not: null };

    const [reviews, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: userSelect },
          product: { select: productSelect },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take,
      }),
      getReviewStats(),
    ]);

    res.status(200).json({
      reviews: reviews.map(reviewToClient),
      stats,
      page,
      hasMore: reviews.length === take,
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body?.status ?? "");
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid review status" });
    }

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }

    const review = await prisma.review.update({ where: { id }, data: { status } });
    res.status(200).json(reviewToClient(review));
  } catch (error) {
    console.error("Error updating review status:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Review not found" });
    }

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }

    await prisma.review.delete({ where: { id } });
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export {
  getProductReviews,
  getSiteReviews,
  createReview,
  getReviews,
  updateReviewStatus,
  deleteReview,
};
