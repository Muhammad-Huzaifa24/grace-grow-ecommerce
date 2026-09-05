import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { categoriesQuery, productsQuery } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ØRE — Considered objects for calm interiors" },
      {
        name: "description",
        content:
          "Small-batch lighting, textiles and objects. Shop the ØRE collection of quiet, durable pieces for the home.",
      },
      { property: "og:title", content: "ØRE — Considered objects for calm interiors" },
      {
        property: "og:description",
        content: "Small-batch lighting, textiles and objects for the home.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQuery({ featured: true })),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  component: Home,
});

function Home() {
  const { data: featured } = useSuspenseQuery(productsQuery({ featured: true }));
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const hero = featured[0];

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow">New season</p>
          <h1 className="mt-4 text-5xl leading-[1.05] md:text-6xl">
            Objects that ask
            <br />
            for nothing.
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            Lighting, textiles and everyday objects made in small batches from honest materials —
            designed to settle quietly into the rooms you already love.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/shop">
                Shop the collection <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/categories">Browse categories</Link>
            </Button>
          </div>
        </div>
        {hero && (
          <Link to="/product/$slug" params={{ slug: hero.slug }} className="group block">
            <div className="overflow-hidden rounded-sm border border-border/60 bg-card">
              <img
                src={hero.product_images[0]?.url ?? ""}
                alt={hero.name}
                width={1024}
                height={1024}
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Featured — {hero.name}</p>
          </Link>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl">Featured pieces</h2>
          <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} eager={i < 2} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl">Shop by category</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="rounded-sm border border-border/60 bg-card p-6 transition-colors hover:border-primary/50"
            >
              <p className="text-lg">{c.name}</p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
