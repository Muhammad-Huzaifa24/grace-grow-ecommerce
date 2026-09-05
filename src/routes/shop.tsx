import { createFileRoute } from "@tanstack/react-router";
import { ProductBrowser } from "@/components/product-browser";
import { categoriesQuery, productsQuery } from "@/lib/store";

type ShopSearch = { category?: string; sort?: string; q?: string; inStock?: boolean };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    sort: typeof search.sort === "string" ? search.sort : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
    inStock: search.inStock === true || search.inStock === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop all — ØRE" },
      {
        name: "description",
        content: "Browse every ØRE piece: lighting, textiles, storage and objects, with filters for category, price and availability.",
      },
      { property: "og:title", content: "Shop all — ØRE" },
      { property: "og:description", content: "Browse every ØRE piece with filters and sorting." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQuery()),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">No products.</div>
  ),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  return (
    <ProductBrowser
      title="Shop all"
      subtitle="Every piece currently in the collection."
      search={search}
      routeTo="/shop"
      showFilters
    />
  );
}
