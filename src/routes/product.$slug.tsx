import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { formatPrice, productQuery, productsQuery } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ loaderData }) => {
    const product = (loaderData as { product?: { name: string; description: string | null } } | undefined)?.product;
    if (!product) {
      return { meta: [{ title: "Unavailable — ØRE" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${product.name} — ØRE`;
    const description = (product.description ?? "A considered piece from ØRE.").slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const [product] = await Promise.all([
      context.queryClient.ensureQueryData(productQuery(params.slug)),
      context.queryClient.ensureQueryData(productsQuery()),
    ]);
    if (!product) throw notFound();
    return { product };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-5 py-24 text-center">
      <h1 className="text-3xl">Product not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        It may have been removed.{" "}
        <Link to="/shop" className="underline">
          Back to shop
        </Link>
      </p>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { data: all } = useSuspenseQuery(productsQuery());
  const cart = useCart();
  const [variantId, setVariantId] = React.useState<string | null>(null);
  const [imageIndex, setImageIndex] = React.useState(0);
  const [qty, setQty] = React.useState(1);

  if (!product) return null;

  const variants = product.product_variants;
  const variant = variants.find((v) => v.id === variantId) ?? null;
  const price = variant?.price ?? product.price;
  const stock = variant ? variant.stock : product.stock;
  const needsVariant = variants.length > 0 && !variant;
  const soldOut = stock <= 0;
  const onSale = product.compare_at_price && product.compare_at_price > price;
  const related = all.filter((p) => p.id !== product.id && p.categories?.slug === product.categories?.slug).slice(0, 4);
  const image = product.product_images[imageIndex] ?? product.product_images[0];

  function addToCart() {
    if (!product) return;
    if (needsVariant) {
      toast.error("Please choose an option first");
      return;
    }
    cart.add(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        slug: product.slug,
        name: product.name,
        variantLabel: variant?.name ?? null,
        price,
        imageUrl: product.product_images[0]?.url ?? null,
      },
      qty,
    );
    toast.success(`${product.name} added to your bag`);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/shop" className="hover:text-foreground">
          Shop
        </Link>
        {product.categories && (
          <>
            {" / "}
            <Link
              to="/category/$slug"
              params={{ slug: product.categories.slug }}
              className="hover:text-foreground"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-sm border border-border/60 bg-card">
            {image ? (
              <img
                src={image.url}
                alt={image.alt ?? product.name}
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="aspect-square w-full bg-muted" />
            )}
          </div>
          {product.product_images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.product_images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setImageIndex(i)}
                  className={cn(
                    "size-16 overflow-hidden rounded-sm border",
                    i === imageIndex ? "border-primary" : "border-border/60",
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img.url} alt="" loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.categories && <p className="eyebrow">{product.categories.name}</p>}
          <h1 className="mt-3 text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-2xl">{formatPrice(price)}</p>
            {onSale && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_at_price!)}
              </p>
            )}
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {variants.length > 0 && (
            <div className="mt-8">
              <p className="eyebrow">Options</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={v.stock <= 0}
                    className={cn(
                      "rounded-sm border px-4 py-2 text-sm transition-colors disabled:opacity-40",
                      v.id === variantId
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/60",
                    )}
                  >
                    {v.name}
                    {v.stock <= 0 ? " · sold out" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-sm border border-border">
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                <Plus className="size-4" />
              </Button>
            </div>
            <Button size="lg" className="flex-1" disabled={soldOut} onClick={addToCart}>
              {soldOut ? "Sold out" : "Add to bag"}
            </Button>
          </div>

          <Separator className="my-8" />
          <dl className="space-y-2 text-sm text-muted-foreground">
            {product.sku && (
              <div className="flex justify-between">
                <dt>SKU</dt>
                <dd>{variant ? `${product.sku}-${variant.name}` : product.sku}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Availability</dt>
              <dd>{soldOut ? "Out of stock" : `${stock} in stock`}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>Free over $250</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-3xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
