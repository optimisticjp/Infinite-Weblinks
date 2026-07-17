import type { CustomerJourneyStep } from "@/lib/content/types";

/**
 * "How everything connects" (ref 15) — one customer followed from first discovery to
 * repeat purchase, so the connected system is shown, not just claimed. Screens are
 * stylised, generic interface states: no real brand, client, quote, price or metric
 * (brief §14). The example is an anonymous apparel store, chosen only because a product
 * journey reads clearly.
 */
export const customerJourney: CustomerJourneyStep[] = [
  {
    order: 1,
    phase: "Discover",
    caption: "A customer sees your content or an advert on social.",
    color: "var(--violet)",
    screen: { kind: "social", heading: "New drop is live", lines: ["Sponsored", "Shop the collection"] },
  },
  {
    order: 2,
    phase: "Visit store",
    caption: "They browse the products on your website.",
    color: "var(--blue)",
    screen: { kind: "store", heading: "New arrivals", lines: ["New in", "Best sellers", "Accessories"] },
  },
  {
    order: 3,
    phase: "Take action",
    caption: "They add something to the cart or sign up.",
    color: "var(--cyan)",
    screen: { kind: "product", heading: "Added to cart", lines: ["Choose size", "Add to cart", "Save for later"] },
  },
  {
    order: 4,
    phase: "Follow up",
    caption: "Email or a message brings them back to finish.",
    color: "var(--pink)",
    screen: { kind: "message", heading: "Still thinking it over?", lines: ["Your picks are waiting", "Return to cart"] },
  },
  {
    order: 5,
    phase: "Purchase",
    caption: "The order is completed and confirmed.",
    color: "var(--orange)",
    screen: { kind: "confirmation", heading: "Order confirmed", lines: ["Thanks for your order", "View order"] },
  },
  {
    order: 6,
    phase: "Retain & grow",
    caption: "Loyalty and personalised offers earn the next purchase.",
    color: "var(--lime)",
    screen: { kind: "loyalty", heading: "Rewards unlocked", lines: ["Early access", "Member offers", "Just for you"] },
  },
];
