import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, orderQuery } from "@/lib/store";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order details — ØRE" },
      { name: "description", content: "See the items, totals and status of your ØRE order." },
      { property: "og:title", content: "Order details — ØRE" },
      { property: "og:description", content: "Items, totals and status for your ØRE order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderDetailPage,
});

type Address = {
  full_name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
};

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const order = useQuery(orderQuery(orderId));
  const invoice = useQuery({
    queryKey: ["invoice", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, number, total, currency, issued_at")
        .eq("order_id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (order.isLoading) {
    return <div className="mx-auto max-w-3xl px-5 py-24 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!order.data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-3xl">Order not found</h1>
        <Button asChild className="mt-6">
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const o = order.data;
  const address = (o.shipping_address ?? {}) as Address;
  const items = o.order_items ?? [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/orders" className="text-xs text-muted-foreground hover:text-foreground">
        ← Back to orders
      </Link>
      <h1 className="mt-4 text-4xl">{o.order_number}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Placed {new Date(o.created_at).toLocaleString()} · <span className="capitalize">{o.status}</span> ·
        payment <span className="capitalize">{o.payment_status}</span>
      </p>

      <section className="mt-10 rounded-sm border border-border/60 bg-card p-6">
        <h2 className="text-xl">Items</h2>
        <ul className="mt-4 divide-y divide-border/70">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  width={96}
                  height={96}
                  loading="lazy"
                  className="size-16 rounded-sm object-cover"
                />
              ) : (
                <div className="size-16 rounded-sm bg-muted" />
              )}
              <div className="flex-1">
                <p className="text-sm">{item.product_name}</p>
                {item.variant_label && (
                  <p className="mt-1 text-xs text-muted-foreground">{item.variant_label}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <p className="text-sm">{formatPrice(Number(item.unit_price) * item.quantity, o.currency)}</p>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(Number(o.subtotal), o.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{Number(o.shipping) === 0 ? "Free" : formatPrice(Number(o.shipping), o.currency)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt>Total</dt>
            <dd>{formatPrice(Number(o.total), o.currency)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-sm border border-border/60 bg-card p-6 text-sm">
          <h2 className="text-xl">Shipping to</h2>
          <address className="mt-4 not-italic text-muted-foreground">
            {address.full_name && <div>{address.full_name}</div>}
            {address.line1 && <div>{address.line1}</div>}
            {address.line2 && <div>{address.line2}</div>}
            <div>
              {[address.city, address.state, address.postal_code].filter(Boolean).join(", ")}
            </div>
            {address.country && <div>{address.country}</div>}
            {address.phone && <div>{address.phone}</div>}
          </address>
        </div>
        <div className="rounded-sm border border-border/60 bg-card p-6 text-sm">
          <h2 className="text-xl">Contact</h2>
          <p className="mt-4 text-muted-foreground">{o.email}</p>
          {o.notes && <p className="mt-3 text-muted-foreground">Notes: {o.notes}</p>}
        </div>
      </section>
    </div>
  );
}
