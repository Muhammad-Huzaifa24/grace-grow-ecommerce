import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductBrowser } from "@/components/product-browser";
import { categoriesQuery, productsQuery } from "@/lib/store";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name.charAt(0).toUpperCase() + name.slice(1)} — ØRE`;
    return {
      meta: [
        { title },
        { name: "description", content: `Shop ØRE ${name}: small-batch pieces for calm interiors.` },
        { property: "og:title", content: title },
        { property: "og:description", content: `Shop ØRE ${name}.` },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const [, categories] = await Promise.all([
      context.queryClient.ensureQueryData(productsQuery()),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
    if (!categories.some((c) => c.slug === params.slug)) throw notFound();
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">
      This category doesn't exist.
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const category = categories.find((c) => c.slug === slug);

  return (
    <ProductBrowser
      title={category?.name ?? "Category"}
      subtitle={category?.description ?? undefined}
      search={{}}
      fixedCategory={slug}
    />
  );
}
