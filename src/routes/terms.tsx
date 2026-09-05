import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ØRE" },
      { name: "description", content: "The terms that apply when you browse and buy from the ØRE store." },
      { property: "og:title", content: "Terms of Service — ØRE" },
      { property: "og:description", content: "The terms that apply when you browse and buy from ØRE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms govern your use of the ØRE store and any order you place with us."
      sections={[
        {
          heading: "Ordering",
          body: "Placing an order is an offer to buy. We confirm the order by email and reserve the right to decline or cancel an order if an item is unavailable or a pricing error occurred.",
        },
        {
          heading: "Pricing and payment",
          body: "Prices are shown in the store currency and include applicable item pricing only; shipping is added at checkout. Payment is taken at the time of order.",
        },
        {
          heading: "Shipping",
          body: "We ship to the addresses supported at checkout. Delivery estimates are indicative and not guaranteed.",
        },
        {
          heading: "Returns",
          body: "Returns are handled under our refund policy. Items must be unused and in their original packaging.",
        },
        {
          heading: "Contact",
          body: "Questions about these terms can be sent to the support address listed in the store settings.",
        },
      ]}
    />
  );
}
