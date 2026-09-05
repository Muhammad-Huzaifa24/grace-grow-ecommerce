import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice, settingsQuery } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — ØRE" },
      { name: "description", content: "Review the pieces in your ØRE bag before checkout." },
      { property: "og:title", content: "Your bag — ØRE" },
      { property: "og:description", content: "Review your ØRE bag before checkout." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-4xl px-5 py-24 text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-4xl px-5 py-24 text-sm text-muted-foreground">Nothing here.</div>
  ),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { data: settings } = useSuspenseQuery(settingsQuery);

  const flat = settings?.shipping_flat_rate ?? 12;
  const threshold = settings?.free_shipping_threshold ?? 250;
  const shipping = cart.subtotal === 0 || cart.subtotal >= threshold ? 0 : flat;

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-24 text-center">
        <h1 className="text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Nothing added yet — start with the featured pieces.
        </p>
        <Button asChild className="mt-8">
          <Link to="/shop">Shop the collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-4xl">Your bag</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <ul className="divide-y divide-border/70 border-y border-border/70">
          {cart.lines.map((line) => (
            <li key={`${line.productId}-${line.variantId ?? "base"}`} className="flex gap-4 py-6">
              <Link to="/product/$slug" params={{ slug: line.slug }} className="shrink-0">
                {line.imageUrl ? (
                  <img
                    src={line.imageUrl}
                    alt={line.name}
                    width={1024}
                    height={1024}
                    loading="lazy"
                    className="size-24 rounded-sm object-cover"
                  />
                ) : (
                  <div className="size-24 rounded-sm bg-muted" />
                )}
              </Link>
              <div className="flex-1">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link to="/product/$slug" params={{ slug: line.slug }} className="text-sm font-medium">
                      {line.name}
                    </Link>
                    {line.variantLabel && (
                      <p className="mt-1 text-xs text-muted-foreground">{line.variantLabel}</p>
                    )}
                  </div>
                  <p className="text-sm">{formatPrice(line.price * line.quantity)}</p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center rounded-sm border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Decrease quantity"
                      onClick={() => cart.setQuantity(line.productId, line.variantId, line.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-7 text-center text-sm">{line.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Increase quantity"
                      onClick={() => cart.setQuantity(line.productId, line.variantId, line.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => cart.remove(line.productId, line.variantId)}
                  >
                    <X className="mr-1 size-3.5" /> Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-sm border border-border/60 bg-card p-6">
          <h2 className="text-xl">Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
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
              <dd>{formatPrice(cart.subtotal + shipping)}</dd>
            </div>
          </dl>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link to="/checkout">Checkout</Link>
          </Button>
          <Link
            to="/shop"
            className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
