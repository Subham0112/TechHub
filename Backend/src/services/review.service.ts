import { prisma } from "../config/prisma";
import type { Review, User, Product } from "../../generated/prisma/client";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewClient = {
  id: number;
  _id: string;
  productId: number | null;
  userId: number;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: { id: number; _id: string; name: string; profilePic: string | null } | null;
  product?: { id: number; _id: string; name: string; image: string; slug: string } | null;
};

export type RatingSummary = { rating: number; reviewCount: number };

type ReviewRow = Review & {
  user?: Pick<User, "id" | "name" | "profilePic"> | null;
  product?: Pick<Product, "id" | "name" | "image" | "slug"> | null;
};

export const reviewToClient = (r: ReviewRow): ReviewClient => ({
  id: r.id,
  _id: String(r.id),
  productId: r.productId,
  userId: r.userId,
  rating: r.rating,
  comment: r.comment,
  status: r.status as ReviewStatus,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  user: r.user
    ? { id: r.user.id, _id: String(r.user.id), name: r.user.name, profilePic: r.user.profilePic }
    : undefined,
  product: r.product
    ? {
        id: r.product.id,
        _id: String(r.product.id),
        name: r.product.name,
        image: r.product.image,
        slug: r.product.slug,
      }
    : undefined,
});

export const getRatingMap = async (
  productIds?: number[]
): Promise<Map<number, RatingSummary>> => {
  const rows = await prisma.review.groupBy({
    by: ["productId"],
    where: {
      status: "approved",
      productId: productIds && productIds.length ? { in: productIds } : { not: null },
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return new Map(
    rows
      .filter((r): r is typeof r & { productId: number } => r.productId !== null)
      .map((r) => [
        r.productId,
        {
          rating: Math.round((r._avg.rating ?? 0) * 10) / 10,
          reviewCount: r._count.rating,
        },
      ])
  );
};

export const getSiteSummary = async (): Promise<RatingSummary> => {
  const agg = await prisma.review.aggregate({
    where: { productId: null, status: "approved" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
    reviewCount: agg._count.rating,
  };
};

export const getReviewStats = async () => {
  const [byStatus, approvedAvg] = await Promise.all([
    prisma.review.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.review.aggregate({
      where: { status: "approved" },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<ReviewStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  let total = 0;
  for (const row of byStatus) {
    const status = row.status as ReviewStatus;
    if (counts[status] !== undefined) counts[status] = row._count._all;
    total += row._count._all;
  }

  return {
    total,
    pending: counts.pending,
    approved: counts.approved,
    rejected: counts.rejected,
    averageRating: Math.round((approvedAvg._avg.rating ?? 0) * 10) / 10,
  };
};
