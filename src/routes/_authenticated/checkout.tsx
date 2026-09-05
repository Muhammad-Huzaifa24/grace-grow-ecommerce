import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/use-session";
import { useCart } from "@/lib/cart";
import { formatPrice, settingsQuery } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ØRE" },
      { name: "description", content: "Confirm your shipping details and place your ØRE order." },
      { property: "og:title", content: "Checkout — ØRE" },
      { property: "og:description", content: "Complete your ØRE order securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useSession();
  const cart = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = React.useState(false);

  const { data: settings } = useQuery(settingsQuery);
  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name,email,phone")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const flat = settings?.shipping_flat_rate ?? 12;
  const threshold = settings?.free_shipping_threshold ?? 250;
  const shipping = cart.subtotal === 0 || cart.subtotal >= threshold ? 0 : flat;
  const total = cart.subtotal + shipping;

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cart.lines.length === 0) return;
    const form = new FormData(e.currentTarget);
    const address = {
      full_name: String(form.get("full_name") ?? ""),
      line1: String(form.get("line1") ?? ""),
      line2: String(form.get("line2") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      postal_code: String(form.get("postal_code") ?? ""),
      country: String(form.get("country") ?? ""),
      phone: String(form.get("phone") ?? ""),
    };

    setPlacing(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          email: String(form.get("email") ?? user!.email ?? ""),
          subtotal: cart.subtotal,
          shipping,
          total,
          shipping_address: address,
          notes: String(form.get("notes") ?? "") || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase.from("order_items").insert(
        cart.lines.map((l) => ({
          order_id: order.id,
          product_id: l.productId,
          variant_id: l.variantId,
          product_name: l.name,
          variant_label: l.variantLabel,
          image_url: l.imageUrl,
          unit_price: l.price,
          quantity: l.quantity,
        })),
      );
      if (itemsError) throw itemsError;

      const { error: paymentError } = await supabase
        .from("payments")
        .insert({ order_id: order.id, amount: total, provider: "manual", status: "pending" });
      if (paymentError) throw paymentError;

      cart.clear();
      toast.success("Order placed");
      navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place the order");
    } finally {
      setPlacing(false);
    }
  }

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-24 text-center">
        <h1 className="text-4xl">Nothing to check out</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your bag is empty.</p>
        <Button asChild className="mt-8">
          <Link to="/shop">Shop the collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-4xl">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6 rounded-sm border border-border/60 bg-card p-6">
          <h2 className="text-xl">Shipping details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="full_name" label="Full name" defaultValue={profile.data?.full_name ?? ""} required />
            <Field
              id="email"
              label="Email"
              type="email"
              defaultValue={profile.data?.email ?? user?.email ?? ""}
              required
            />
            <Field id="line1" label="Address" required className="sm:col-span-2" />
            <Field id="line2" label="Apartment, suite (optional)" className="sm:col-span-2" />
            <Field id="city" label="City" required />
            <Field id="state" label="State / region" />
            <Field id="postal_code" label="Postal code" required />
            <Field id="country" label="Country" defaultValue="US" required />
            <Field id="phone" label="Phone" defaultValue={profile.data?.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Order notes (optional)</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>
          <p className="text-xs text-muted-foreground">
            Payment is recorded as pending — card payment arrives in the next stage.
          </p>
        </div>

        <aside className="h-fit rounded-sm border border-border/60 bg-card p-6">
          <h2 className="text-xl">Your order</h2>
          <ul className="mt-6 space-y-3 text-sm">
            {cart.lines.map((line) => (
              <li key={`${line.productId}-${line.variantId ?? "base"}`} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {line.name}
                  {line.variantLabel ? ` · ${line.variantLabel}` : ""} × {line.quantity}
                </span>
                <span>{formatPrice(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <Separator />
            <div className="flex justify-between text-base">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={placing}>
            {placing ? "Placing order…" : "Place order"}
          </Button>
          <Link to="/cart" className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground">
            Back to bag
          </Link>
        </aside>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...props} />
    </div>
  );
}
