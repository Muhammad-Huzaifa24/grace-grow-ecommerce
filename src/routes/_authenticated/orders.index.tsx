import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, ordersQuery } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({
    meta: [
      { title: "Order history — ØRE" },
      { name: "description", content: "Review every ØRE order you have placed and its current status." },
      { property: "og:title", content: "Order history — ØRE" },
      { property: "og:description", content: "Track your ØRE orders and their status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const orders = useQuery(ordersQuery);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-4xl">Order history</h1>

      {orders.isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}

      {orders.data && orders.data.length === 0 && (
        <div className="mt-10 rounded-sm border border-border/60 bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">You haven’t placed an order yet.</p>
          <Button asChild className="mt-6">
            <Link to="/shop">Shop the collection</Link>
          </Button>
        </div>
      )}

      {orders.data && orders.data.length > 0 && (
        <ul className="mt-10 divide-y divide-border/70 border-y border-border/70">
          {orders.data.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-5">
              <div>
                <Link
                  to="/orders/$orderId"
                  params={{ orderId: o.id }}
                  className="text-sm font-medium hover:underline"
                >
                  {o.order_number}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-muted-foreground capitalize">{o.status}</span>
                <span className="text-muted-foreground capitalize">{o.payment_status}</span>
                <span>{formatPrice(Number(o.total), o.currency)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
