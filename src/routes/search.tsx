import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { ProductBrowser } from "@/components/product-browser";
import { categoriesQuery, productsQuery } from "@/lib/store";
import { Input } from "@/components/ui/input";

type SearchParams = { q?: string; category?: string; sort?: string; inStock?: boolean };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    sort: typeof search.sort === "string" ? search.sort : undefined,
    inStock: search.inStock === true || search.inStock === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search — ØRE" },
      { name: "description", content: "Search the ØRE catalogue of lighting, textiles and objects." },
      { property: "og:title", content: "Search — ØRE" },
      { property: "og:description", content: "Find the piece you're looking for at ØRE." },
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
    <div className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">No results.</div>
  ),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [term, setTerm] = React.useState(search.q ?? "");

  React.useEffect(() => setTerm(search.q ?? ""), [search.q]);

  React.useEffect(() => {
    const id = setTimeout(() => {
      if ((search.q ?? "") !== term)
        navigate({ search: (prev) => ({ ...prev, q: term || undefined }) });
    }, 250);
    return () => clearTimeout(id);
  }, [term, search.q, navigate]);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 pt-12">
        <div className="relative max-w-lg">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="h-11 pl-9"
          />
        </div>
      </div>
      <ProductBrowser
        title={search.q ? `Results for “${search.q}”` : "Search"}
        search={search}
        routeTo="/search"
        showFilters
      />
    </div>
  );
}
