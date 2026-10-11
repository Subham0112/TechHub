import type { Offer, Product } from "../types";

export interface PricingLine {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AppliedCombo {
  offerId: number;
  title: string;
  units: number;
  savings: number;
}

export interface CartPricingResult {
  lines: PricingLine[];
  itemsSubtotal: number;
  discount: number;
  total: number;
  appliedCombos: AppliedCombo[];
}

export interface PricingItem {
  product: Product;
  quantity: number;
}

type Priceable = { _id: string; id?: string; price: number };

const matches = (offerProduct: { id: number; _id: string }, product: Priceable): boolean =>
  offerProduct._id === product._id || String(offerProduct.id) === String(product.id ?? product._id);

export const getEffectivePrice = (product: Priceable, offers: Offer[]): number => {
  let best = product.price;
  for (const offer of offers) {
    if (offer.type === "combo") continue;
    const match = offer.products.find((p) => matches(p, product));
    if (match && match.offerPrice < best) best = match.offerPrice;
  }
  return best;
};

export const getBestOffer = (product: Priceable, offers: Offer[]): Offer | null => {
  let best: Offer | null = null;
  let bestPrice = product.price;
  for (const offer of offers) {
    if (offer.type === "combo") continue;
    const match = offer.products.find((p) => matches(p, product));
    if (match && match.offerPrice < bestPrice) {
      bestPrice = match.offerPrice;
      best = offer;
    }
  }
  return best;
};

export const computeCartPricing = (items: PricingItem[], offers: Offer[]): CartPricingResult => {
  const remaining = new Map<string, number>();
  for (const item of items) {
    const key = item.product._id;
    remaining.set(key, (remaining.get(key) ?? 0) + item.quantity);
  }

  const combos = offers.filter((o) => o.type === "combo" && o.comboPrice && o.comboPrice > 0);

  const comboCandidates = combos
    .map((offer) => {
      const productIds = offer.products.map((p) => p._id);
      const units = Math.min(...productIds.map((id) => remaining.get(id) ?? 0));
      const regularTotal = offer.products.reduce(
        (sum, p) => sum + getEffectivePrice(p, offers),
        0
      );
      const savingsPerUnit = regularTotal - (offer.comboPrice as number);
      return { offer, productIds, units, savingsPerUnit };
    })
    .filter((c) => Number.isFinite(c.units) && c.units > 0 && c.savingsPerUnit > 0)
    .sort((a, b) => b.savingsPerUnit * b.units - a.savingsPerUnit * a.units);

  const appliedCombos: AppliedCombo[] = [];
  let discount = 0;

  for (const { offer, productIds, units, savingsPerUnit } of comboCandidates) {
    if (units <= 0) continue;
    for (const id of productIds) {
      remaining.set(id, (remaining.get(id) ?? 0) - units);
    }
    const savings = units * savingsPerUnit;
    discount += savings;
    appliedCombos.push({
      offerId: offer.id,
      title: offer.title,
      units,
      savings,
    });
  }

  const lines = items.map((item) => {
    const unitPrice = getEffectivePrice(item.product, offers);
    return {
      product: item.product,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });

  const itemsSubtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const total = Math.max(itemsSubtotal - discount, 0);

  return { lines, itemsSubtotal, discount, total, appliedCombos };
};
