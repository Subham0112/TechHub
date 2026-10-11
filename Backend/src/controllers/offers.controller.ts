import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
  getActiveOffersDetailed,
  listOffers,
  validateOfferInput,
  verifyProductIds,
} from "../services/offer.service";

const getOffers = async (req: Request, res: Response) => {
  try {
    const offers = await listOffers({});
    res.status(200).json(offers);
  } catch (error) {
    console.error("Error getting offers:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getActiveOffers = async (req: Request, res: Response) => {
  try {
    const offers = await getActiveOffersDetailed();
    res.status(200).json(offers);
  } catch (error) {
    console.error("Error getting active offers:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const createOffer = async (req: Request, res: Response) => {
  try {
    const { data, error } = validateOfferInput(req.body ?? {});
    if (!data) return res.status(400).json({ message: error ?? "Invalid offer" });

    if (data.appliesTo === "products" && !(await verifyProductIds(data.productIds))) {
      return res.status(400).json({ message: "Some selected products no longer exist" });
    }

    const offer = await prisma.offer.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        discountValue: data.discountValue,
        comboPrice: data.comboPrice,
        appliesTo: data.appliesTo,
        category: data.category,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        isActive: data.isActive,
        ...(data.appliesTo === "products" && data.productIds.length
          ? { products: { create: data.productIds.map((productId) => ({ productId })) } }
          : {}),
      },
    });

    const [client] = await listOffers({ id: offer.id });
    res.status(201).json(client);
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const updateOffer = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const existing = await prisma.offer.findUnique({
      where: { id },
      include: { products: { select: { productId: true } } },
    });
    if (!existing) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const body = req.body ?? {};
    const merged: Record<string, unknown> = {
      title: body.title ?? existing.title,
      description: body.description !== undefined ? body.description : existing.description,
      type: body.type ?? existing.type,
      discountValue: body.discountValue ?? existing.discountValue,
      comboPrice: body.comboPrice !== undefined ? body.comboPrice : existing.comboPrice,
      appliesTo: body.appliesTo ?? existing.appliesTo,
      category: body.category !== undefined ? body.category : existing.category,
      productIds:
        body.productIds !== undefined
          ? body.productIds
          : existing.products.map((p) => p.productId),
      startsAt: body.startsAt !== undefined ? body.startsAt : existing.startsAt,
      endsAt: body.endsAt !== undefined ? body.endsAt : existing.endsAt,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
    };

    const { data, error } = validateOfferInput(merged);
    if (!data) return res.status(400).json({ message: error ?? "Invalid offer" });

    if (data.appliesTo === "products" && !(await verifyProductIds(data.productIds))) {
      return res.status(400).json({ message: "Some selected products no longer exist" });
    }

    const previousIds = existing.products.map((p) => p.productId).sort((a, b) => a - b);
    const nextIds = [...data.productIds].sort((a, b) => a - b);
    const productsChanged =
      previousIds.length !== nextIds.length ||
      previousIds.some((value, i) => value !== nextIds[i]);

    await prisma.$transaction(async (tx) => {
      await tx.offer.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          discountValue: data.discountValue,
          comboPrice: data.comboPrice,
          appliesTo: data.appliesTo,
          category: data.category,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          isActive: data.isActive,
        },
      });

      if (productsChanged) {
        await tx.offerProduct.deleteMany({ where: { offerId: id } });
        if (data.appliesTo === "products" && data.productIds.length) {
          await tx.offerProduct.createMany({
            data: data.productIds.map((productId) => ({ offerId: id, productId })),
          });
        }
      }
    });

    const [client] = await listOffers({ id });
    res.status(200).json(client);
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const toggleOffer = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const existing = await prisma.offer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Offer not found" });
    }

    await prisma.offer.update({ where: { id }, data: { isActive: !existing.isActive } });
    const [client] = await listOffers({ id });
    res.status(200).json(client);
  } catch (error) {
    console.error("Error toggling offer:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const deleteOffer = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const existing = await prisma.offer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Offer not found" });
    }

    await prisma.offer.delete({ where: { id } });
    res.status(200).json({ message: "Offer deleted" });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export { getOffers, getActiveOffers, createOffer, updateOffer, toggleOffer, deleteOffer };
