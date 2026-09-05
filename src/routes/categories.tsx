import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { categoriesQuery, productsQuery } from "@/lib/store";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — ØRE" },
      {
        name: "description",
        content: "Browse ØRE by category: lighting, textiles, storage and everyday objects.",
      },
      { property: "og:title", content: "Categories — ØRE" },
      { property: "og:description", content: "Browse the ØRE collection by category." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery()),
    ]),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">No categories.</div>
  ),
  component: Categories,
});

function Categories() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery());

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl">Categories</h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {categories.map((c) => {
          const items = products.filter((p) => p.categories?.slug === c.slug);
          const cover = items[0]?.product_images[0];
          return (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group overflow-hidden rounded-sm border border-border/60 bg-card"
            >
              {cover ? (
                <img
                  src={cover.url}
                  alt={c.name}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="aspect-[16/9] w-full bg-muted" />
              )}
              <div className="p-6">
                <h2 className="text-2xl">{c.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">{items.length} products</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
