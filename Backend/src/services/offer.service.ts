import { prisma } from "../config/prisma";
import type { Offer, Product } from "../../generated/prisma/client";

export type OfferType = "percentage" | "fixed" | "combo";
export type OfferAppliesTo = "products" | "category" | "all";

export type OfferProductRef = {
  id: number;
  _id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  category: string;
  offerPrice: number;
};

export type OfferClient = {
  id: number;
  _id: string;
  title: string;
  description: string | null;
  type: OfferType;
  discountValue: number;
  comboPrice: number | null;
  appliesTo: OfferAppliesTo;
  category: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
  products: OfferProductRef[];
  createdAt: Date;
  updatedAt: Date;
};

export type IndividualOfferInfo = {
  offerId: number;
  title: string;
  offerPrice: number;
  offerLabel: string;
};

export type ResolvedCombo = {
  offerId: number;
  title: string;
  comboPrice: number;
  productIds: number[];
};

export type PricingMaps = {
  individual: Map<number, IndividualOfferInfo>;
  combos: ResolvedCombo[];
  priceById: Map<number, number>;
};

export type CartLine = { productId: number; quantity: number };

export type CartPricing = {
  lines: { productId: number; quantity: number; unitPrice: number; subtotal: number }[];
  itemsSubtotal: number;
  discount: number;
  total: number;
  appliedCombos: { offerId: number; title: string; units: number; savings: number }[];
};

type RawOffer = Offer & { products: { productId: number }[] };

const isInWindow = (offer: Offer, now: Date): boolean => {
  if (offer.startsAt && offer.startsAt > now) return false;
  if (offer.endsAt && offer.endsAt < now) return false;
  return true;
};

const computeOfferPrice = (offer: Offer, price: number): number => {
  if (offer.type === "percentage") {
    const pct = Math.min(Math.max(offer.discountValue, 0), 100);
    return Math.round(price * (1 - pct / 100));
  }
  if (offer.type === "fixed") {
    return Math.max(price - offer.discountValue, 0);
  }
  return price;
};

const offerLabel = (offer: Offer): string => {
  if (offer.type === "percentage") return `${offer.discountValue}% OFF`;
  if (offer.type === "fixed") return `Rs.${offer.discountValue.toLocaleString("en-IN")} OFF`;
  return "";
};

const resolveOfferProductIds = async (offers: RawOffer[]): Promise<number[][]> => {
  const needsCategory = offers.filter((o) => o.appliesTo === "category" && o.category);
  const needsAll = offers.some((o) => o.appliesTo === "all");

  let categoryIds = new Map<string, number[]>();
  let allIds: number[] | null = null;

  if (needsCategory.length) {
    const cats = [...new Set(needsCategory.map((o) => o.category as string))];
    const rows = await prisma.product.findMany({
      where: { category: { in: cats } },
      select: { id: true, category: true },
    });
    categoryIds = new Map(
      cats.map((c) => [c, rows.filter((r) => r.category === c).map((r) => r.id)])
    );
  }

  if (needsAll) {
    allIds = (await prisma.product.findMany({ select: { id: true } })).map((r) => r.id);
  }

  return offers.map((o) => {
    if (o.appliesTo === "all") return allIds ?? [];
    if (o.appliesTo === "category") return categoryIds.get(o.category ?? "") ?? [];
    return o.products.map((p) => p.productId);
  });
};

const fetchOffers = async (where: Record<string, unknown>): Promise<RawOffer[]> =>
  prisma.offer.findMany({
    where,
    include: { products: { select: { productId: true } } },
    orderBy: { createdAt: "desc" },
  });

const toClient = async (offers: RawOffer[], productIdsPerOffer: number[][]): Promise<OfferClient[]> => {
  const allIds = [...new Set(productIdsPerOffer.flat())];
  const products = allIds.length
    ? await prisma.product.findMany({ where: { id: { in: allIds } } })
    : [];
  const productById = new Map(products.map((p) => [p.id, p]));

  return offers.map((offer, i) => ({
    id: offer.id,
    _id: String(offer.id),
    title: offer.title,
    description: offer.description,
    type: offer.type as OfferType,
    discountValue: offer.discountValue,
    comboPrice: offer.comboPrice,
    appliesTo: offer.appliesTo as OfferAppliesTo,
    category: offer.category,
    startsAt: offer.startsAt,
    endsAt: offer.endsAt,
    isActive: offer.isActive,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
    products: productIdsPerOffer[i]
      .map((id) => productById.get(id))
      .filter((p): p is Product => Boolean(p))
      .map((p) => ({
        id: p.id,
        _id: String(p.id),
        name: p.name,
        price: p.price,
        image: p.image,
        slug: p.slug,
        category: p.category,
        offerPrice: offer.type === "combo" ? p.price : computeOfferPrice(offer, p.price),
      })),
  }));
};

export const listOffers = async (where: Record<string, unknown> = {}): Promise<OfferClient[]> => {
  const offers = await fetchOffers(where);
  const resolved = await resolveOfferProductIds(offers);
  return toClient(offers, resolved);
};

export const getActiveOffersDetailed = async (): Promise<OfferClient[]> => {
  const now = new Date();
  const offers = (await fetchOffers({ isActive: true })).filter((o) => isInWindow(o, now));
  const resolved = await resolveOfferProductIds(offers);
  return toClient(offers, resolved);
};

export const getPricingMaps = async (): Promise<PricingMaps> => {
  const now = new Date();
  const rawOffers = (await fetchOffers({ isActive: true })).filter((o) => isInWindow(o, now));
  const resolvedIds = await resolveOfferProductIds(rawOffers);

  const products = await prisma.product.findMany({ select: { id: true, price: true } });
  const priceById = new Map(products.map((p) => [p.id, p.price]));

  const individual = new Map<number, IndividualOfferInfo>();
  const combos: ResolvedCombo[] = [];

  rawOffers.forEach((offer, i) => {
    if (offer.type === "combo") {
      const ids = resolvedIds[i].filter((id) => priceById.has(id));
      if (offer.comboPrice && offer.comboPrice > 0 && ids.length >= 2) {
        combos.push({
          offerId: offer.id,
          title: offer.title,
          comboPrice: offer.comboPrice,
          productIds: ids,
        });
      }
      return;
    }

    const label = offerLabel(offer);
    for (const id of resolvedIds[i]) {
      const base = priceById.get(id);
      if (base === undefined) continue;
      const offerPrice = computeOfferPrice(offer, base);
      if (offerPrice >= base) continue;
      const existing = individual.get(id);
      if (!existing || offerPrice < existing.offerPrice) {
        individual.set(id, {
          offerId: offer.id,
          title: offer.title,
          offerPrice,
          offerLabel: label,
        });
      }
    }
  });

  return { individual, combos, priceById };
};

const effectiveUnitPrice = (productId: number, maps: PricingMaps): number =>
  maps.individual.get(productId)?.offerPrice ?? maps.priceById.get(productId) ?? 0;

export const computeCartPricing = (items: CartLine[], maps: PricingMaps): CartPricing => {
  const remaining = new Map<number, number>();
  for (const item of items) {
    remaining.set(item.productId, (remaining.get(item.productId) ?? 0) + item.quantity);
  }

  const comboCandidates = maps.combos
    .map((combo) => {
      const units = Math.min(
        ...combo.productIds.map((id) => remaining.get(id) ?? 0)
      );
      const regularTotal = combo.productIds.reduce(
        (sum, id) => sum + effectiveUnitPrice(id, maps),
        0
      );
      const savingsPerUnit = regularTotal - combo.comboPrice;
      return { combo, units, savingsPerUnit };
    })
    .filter((c) => Number.isFinite(c.units) && c.units > 0 && c.savingsPerUnit > 0)
    .sort((a, b) => b.savingsPerUnit * b.units - a.savingsPerUnit * a.units);

  const appliedCombos: CartPricing["appliedCombos"] = [];
  let discount = 0;

  for (const { combo, units, savingsPerUnit } of comboCandidates) {
    if (units <= 0) continue;
    for (const id of combo.productIds) {
      remaining.set(id, (remaining.get(id) ?? 0) - units);
    }
    const savings = units * savingsPerUnit;
    discount += savings;
    appliedCombos.push({ offerId: combo.offerId, title: combo.title, units, savings });
  }

  const lines = items.map((item) => {
    const unitPrice = effectiveUnitPrice(item.productId, maps);
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });

  const itemsSubtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const total = Math.max(itemsSubtotal - discount, 0);

  return { lines, itemsSubtotal, discount, total, appliedCombos };
};

export type OfferInput = {
  title: string;
  description: string | null;
  type: OfferType;
  discountValue: number;
  comboPrice: number | null;
  appliesTo: OfferAppliesTo;
  category: string | null;
  productIds: number[];
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

const parseDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const validateOfferInput = (
  body: Record<string, unknown>
): { data?: OfferInput; error?: string } => {
  const type = String(body.type ?? "");
  const appliesTo = String(body.appliesTo ?? "");

  if (!["percentage", "fixed", "combo"].includes(type)) {
    return { error: "Invalid offer type" };
  }
  if (!["products", "category", "all"].includes(appliesTo)) {
    return { error: "Invalid appliesTo value" };
  }

  const title = String(body.title ?? "").trim();
  if (title.length < 3 || title.length > 100) {
    return { error: "Title must be between 3 and 100 characters" };
  }

  const description = body.description ? String(body.description).trim() : null;
  const category =
    appliesTo === "category" ? String(body.category ?? "").trim() : null;
  if (appliesTo === "category" && !category) {
    return { error: "Category is required when applying offer to a category" };
  }

  const discountValue = Number(body.discountValue ?? 0);
  const comboPriceRaw = body.comboPrice === null || body.comboPrice === undefined || body.comboPrice === ""
    ? null
    : Number(body.comboPrice);

  if (type === "percentage") {
    if (!Number.isFinite(discountValue) || discountValue <= 0 || discountValue > 100) {
      return { error: "Percentage discount must be between 1 and 100" };
    }
  }
  if (type === "fixed") {
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return { error: "Fixed discount must be greater than 0" };
    }
  }

  let comboPrice: number | null = null;
  if (type === "combo") {
    if (comboPriceRaw === null || !Number.isFinite(comboPriceRaw) || comboPriceRaw <= 0) {
      return { error: "Combo price must be greater than 0" };
    }
    if (appliesTo !== "products") {
      return { error: "Combo offers must apply to explicitly selected products" };
    }
    comboPrice = comboPriceRaw;
  }

  const productIds = Array.isArray(body.productIds)
    ? [...new Set(body.productIds.map(Number).filter((n) => Number.isInteger(n) && n > 0))]
    : [];

  if (appliesTo === "products") {
    const min = type === "combo" ? 2 : 1;
    if (productIds.length < min) {
      return {
        error:
          type === "combo"
            ? "Combo offers need at least 2 products"
            : "Select at least one product",
      };
    }
  }

  const startsAt = parseDate(body.startsAt);
  const endsAt = parseDate(body.endsAt);
  if (startsAt && endsAt && startsAt >= endsAt) {
    return { error: "Start date must be before end date" };
  }

  return {
    data: {
      title,
      description,
      type: type as OfferType,
      discountValue: type === "combo" ? 0 : discountValue,
      comboPrice,
      appliesTo: appliesTo as OfferAppliesTo,
      category,
      productIds,
      startsAt,
      endsAt,
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    },
  };
};

export const verifyProductIds = async (productIds: number[]): Promise<boolean> => {
  if (!productIds.length) return true;
  const count = await prisma.product.count({ where: { id: { in: productIds } } });
  return count === productIds.length;
};
