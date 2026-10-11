import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import slugify from "slugify";

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
};

const toClient = (row: CategoryRow, productCount = 0) => ({
  id: row.id,
  _id: String(row.id),
  name: row.name,
  slug: row.slug,
  productCount,
  createdAt: row.createdAt,
});

const getCategories = async (_req: Request, res: Response) => {
  try {
    const [categories, counts] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.product.groupBy({ by: ["category"], _count: { _all: true } }),
    ]);
    const countMap = new Map(counts.map((c) => [c.category, c._count._all]));

    res
      .status(200)
      .json(categories.map((c) => toClient(c, countMap.get(c.slug) ?? 0)));
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const createCategory = async (req: Request, res: Response) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    if (name.length < 2 || name.length > 60) {
      return res
        .status(400)
        .json({ message: "Category name must be between 2 and 60 characters" });
    }

    const slug = slugify(name, { lower: true, strict: true });
    if (!slug) {
      return res.status(400).json({ message: "Category name is not valid" });
    }

    const existing = await prisma.category.findFirst({
      where: { OR: [{ slug }, { name }] },
    });
    if (existing) {
      return res.status(409).json({ message: "That category already exists" });
    }

    const created = await prisma.category.create({ data: { name, slug } });
    res.status(201).json(toClient(created));
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Category not found" });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    const used = await prisma.product.count({
      where: { category: existing.slug },
    });
    if (used > 0) {
      return res.status(409).json({
        message: `Cannot delete "${existing.name}" — ${used} item${
          used !== 1 ? "s" : ""
        } still use it.`,
      });
    }

    await prisma.category.delete({ where: { id } });
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export { getCategories, createCategory, deleteCategory };
