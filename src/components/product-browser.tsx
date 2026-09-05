import { useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { categoriesQuery, productsQuery } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BrowserSearch = {
  category?: string | undefined;
  sort?: string | undefined;
  q?: string | undefined;
  inStock?: boolean | undefined;
};

export function ProductBrowser({
  title,
  subtitle,
  search,
  routeTo,
  showFilters = false,
  fixedCategory,
}: {
  title: string;
  subtitle?: string | undefined;
  search: BrowserSearch;
  routeTo?: "/shop" | "/search" | undefined;
  showFilters?: boolean | undefined;
  fixedCategory?: string | undefined;
}) {
  const navigate = useNavigate();
  const { data: products } = useSuspenseQuery(productsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery);

  const category = fixedCategory ?? search.category;
  const term = (search.q ?? "").trim().toLowerCase();

  let list = products.filter((p) => {
    if (category && p.categories?.slug !== category) return false;
    if (search.inStock && p.stock <= 0) return false;
    if (
      term &&
      !`${p.name} ${p.description ?? ""} ${p.categories?.name ?? ""}`.toLowerCase().includes(term)
    )
      return false;
    return true;
  });

  if (search.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (search.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (search.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  const update = (patch: BrowserSearch) => {
    if (!routeTo) return;
    navigate({ to: routeTo, search: (prev: BrowserSearch) => ({ ...prev, ...patch }) });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}

      {showFilters && (
        <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-border/70 py-4">
          <Select
            value={search.category ?? "all"}
            onValueChange={(v) => update({ category: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-44" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={search.sort ?? "newest"}
            onValueChange={(v) => update({ sort: v === "newest" ? undefined : v })}
          >
            <SelectTrigger className="w-44" aria-label="Sort products">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={!!search.inStock}
              onCheckedChange={(v) => update({ inStock: v === true ? true : undefined })}
            />
            <Label htmlFor="in-stock" className="text-sm text-muted-foreground">
              In stock only
            </Label>
          </div>

          {(search.category || search.sort || search.inStock || search.q) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                update({ category: undefined, sort: undefined, inStock: undefined, q: undefined })
              }
            >
              Clear
            </Button>
          )}

          <p className="ml-auto text-sm text-muted-foreground">{list.length} products</p>
        </div>
      )}

      {list.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted-foreground">
          No products match your filters.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} eager={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
