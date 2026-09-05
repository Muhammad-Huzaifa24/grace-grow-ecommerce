import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ØRE" },
      { name: "description", content: "How ØRE collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — ØRE" },
      { property: "og:description", content: "How ØRE collects, uses and protects your personal information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="We collect only what we need to run the store and fulfil your orders."
      sections={[
        {
          heading: "What we collect",
          body: "Your name, email address, shipping address, phone number if provided, and your order history.",
        },
        {
          heading: "Why we collect it",
          body: "To process and deliver orders, to send order and shipping updates, and to provide customer support.",
        },
        {
          heading: "Who we share it with",
          body: "Only the services needed to run the store: our hosting and database provider, our payment provider, and delivery partners. We never sell your data.",
        },
        {
          heading: "Your choices",
          body: "You can view and update your details in your account at any time, and you can ask us to delete your account and personal data.",
        },
        {
          heading: "Cookies",
          body: "We use essential storage in your browser to keep you signed in and to remember the contents of your cart.",
        },
      ]}
    />
  );
}
