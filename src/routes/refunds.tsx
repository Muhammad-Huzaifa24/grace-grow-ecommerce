import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — ØRE" },
      { name: "description", content: "How returns, exchanges and refunds work at the ØRE store." },
      { property: "og:title", content: "Refund Policy — ØRE" },
      { property: "og:description", content: "How returns, exchanges and refunds work at ØRE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro="If something is not right, we will make it right."
      sections={[
        {
          heading: "Return window",
          body: "You may return most items within 30 days of delivery, unused and in their original packaging.",
        },
        {
          heading: "How to start a return",
          body: "Reply to your order confirmation or contact support with your order number and the items you wish to return.",
        },
        {
          heading: "Refunds",
          body: "Once your return arrives and passes inspection, we refund the original payment method. Refunds usually appear within 5–10 business days.",
        },
        {
          heading: "Damaged or incorrect items",
          body: "Tell us within 14 days of delivery and include a photo. We cover the return shipping and send a replacement or a full refund.",
        },
        {
          heading: "Non-returnable items",
          body: "Made-to-order and clearance items are final sale unless faulty.",
        },
      ]}
    />
  );
}
