import { Link } from "@tanstack/react-router";
import { formatPrice, type Product } from "@/lib/store";

export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const image = product.product_images[0];
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const soldOut = product.stock <= 0 && product.product_variants.length === 0;

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block"
      aria-label={product.name}
    >
      <div className="relative overflow-hidden rounded-sm border border-border/60 bg-card">
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? product.name}
            width={1024}
            height={1024}
            loading={eager ? "eager" : "lazy"}
            className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="aspect-square w-full bg-muted" />
        )}
        {(onSale || soldOut) && (
          <span className="absolute left-3 top-3 rounded-sm bg-background/90 px-2 py-1 text-[10px] uppercase tracking-widest">
            {soldOut ? "Sold out" : "Sale"}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">{product.name}</h3>
        <p className="text-sm">
          {onSale && (
            <span className="mr-2 text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
          {formatPrice(product.price)}
        </p>
      </div>
      {product.categories && (
        <p className="mt-1 text-xs text-muted-foreground">{product.categories.name}</p>
      )}
    </Link>
  );
}
