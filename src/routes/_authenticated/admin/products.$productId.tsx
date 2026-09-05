import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/products/$productId")({
  head: () => ({
    meta: [
      { title: "Edit product — ØRE admin" },
      { name: "description", content: "Edit product details, images, variants and inventory." },
      { property: "og:title", content: "Edit product — ØRE admin" },
      { property: "og:description", content: "Edit product details, images, variants and inventory." },
    ],
  }),
  component: EditProduct,
});

function EditProduct() {
  const { productId } = Route.useParams();
  const qc = useQueryClient();

  const product = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,slug,description,price,compare_at_price,sku,stock,is_active,is_featured,category_id,product_images(id,url,alt,position),product_variants(id,name,size,color,sku,price,stock,position)",
        )
        .eq("id", productId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id,name").order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "product", productId] });
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const [categoryId, setCategoryId] = React.useState<string>("");
  const [active, setActive] = React.useState(false);
  const [featured, setFeatured] = React.useState(false);
  React.useEffect(() => {
    if (product.data) {
      setCategoryId(product.data.category_id ?? "none");
      setActive(product.data.is_active);
      setFeatured(product.data.is_featured);
    }
  }, [product.data]);

  const save = useMutation({
    mutationFn: async (form: FormData) => {
      const name = String(form.get("name") ?? "").trim();
      const slugValue = String(form.get("slug") ?? "").trim();
      const compare = String(form.get("compare_at_price") ?? "").trim();
      const { error } = await supabase
        .from("products")
        .update({
          name,
          slug: slugValue ? slugify(slugValue) : slugify(name),
          description: String(form.get("description") ?? ""),
          price: Number(form.get("price") ?? 0),
          compare_at_price: compare ? Number(compare) : null,
          sku: String(form.get("sku") ?? "") || null,
          stock: Number(form.get("stock") ?? 0),
          category_id: categoryId && categoryId !== "none" ? categoryId : null,
          is_active: active,
          is_featured: featured,
        })
        .eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product saved");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addImage = useMutation({
    mutationFn: async (v: { url: string; alt: string }) => {
      const { error } = await supabase.from("product_images").insert({
        product_id: productId,
        url: v.url,
        alt: v.alt || null,
        position: product.data?.product_images.length ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const removeImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const saveVariant = useMutation({
    mutationFn: async (v: { id?: string; values: Record<string, unknown> }) => {
      if (v.id) {
        const { error } = await supabase.from("product_variants").update(v.values).eq("id", v.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("product_variants")
          .insert({ product_id: productId, ...(v.values as { name: string }) });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Variant saved");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeVariant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_variants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const p = product.data;
  if (product.isPending) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!p) return <p className="text-sm text-muted-foreground">Product not found.</p>;

  return (
    <div className="space-y-10">
      <div>
        <Link to="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to products
        </Link>
        <h1 className="mt-3 text-4xl">{p.name}</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(new FormData(e.currentTarget));
        }}
        className="space-y-5 rounded-sm border border-border/60 bg-card p-6"
      >
        <h2 className="text-xl">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={p.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={p.slug} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} defaultValue={p.description ?? ""} />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" step="0.01" defaultValue={String(p.price)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compare_at_price">Compare at</Label>
            <Input
              id="compare_at_price"
              name="compare_at_price"
              type="number"
              step="0.01"
              defaultValue={p.compare_at_price === null ? "" : String(p.compare_at_price)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" defaultValue={p.sku ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" name="stock" type="number" defaultValue={String(p.stock)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorised</SelectItem>
                {(categories.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-7">
            <Switch checked={active} onCheckedChange={setActive} id="active" />
            <Label htmlFor="active">Published</Label>
          </div>
          <div className="flex items-center gap-3 pt-7">
            <Switch checked={featured} onCheckedChange={setFeatured} id="featured" />
            <Label htmlFor="featured">Featured</Label>
          </div>
        </div>
        <Button type="submit" disabled={save.isPending}>
          Save product
        </Button>
      </form>

      <section className="space-y-4 rounded-sm border border-border/60 bg-card p-6">
        <h2 className="text-xl">Images</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {p.product_images
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((img) => (
              <div key={img.id} className="space-y-2">
                <img src={img.url} alt={img.alt ?? p.name} className="aspect-square w-full rounded-sm object-cover" />
                <Button variant="ghost" size="sm" onClick={() => removeImage.mutate(img.id)}>
                  Remove
                </Button>
              </div>
            ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            addImage.mutate({ url: String(form.get("url") ?? ""), alt: String(form.get("alt") ?? "") });
            e.currentTarget.reset();
          }}
          className="flex flex-wrap gap-3"
        >
          <Input name="url" placeholder="Image URL" className="max-w-xs" required />
          <Input name="alt" placeholder="Alt text" className="max-w-xs" />
          <Button type="submit" variant="outline">
            Add image
          </Button>
        </form>
      </section>

      <section className="space-y-4 rounded-sm border border-border/60 bg-card p-6">
        <h2 className="text-xl">Variants &amp; inventory</h2>
        {p.product_variants
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((v) => (
            <form
              key={v.id}
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const price = String(form.get("price") ?? "").trim();
                saveVariant.mutate({
                  id: v.id,
                  values: {
                    name: String(form.get("name") ?? ""),
                    size: String(form.get("size") ?? "") || null,
                    color: String(form.get("color") ?? "") || null,
                    price: price ? Number(price) : null,
                    stock: Number(form.get("stock") ?? 0),
                  },
                });
              }}
              className="grid gap-3 border-b border-border/40 pb-4 sm:grid-cols-6"
            >
              <Input name="name" defaultValue={v.name} placeholder="Name" />
              <Input name="size" defaultValue={v.size ?? ""} placeholder="Size" />
              <Input name="color" defaultValue={v.color ?? ""} placeholder="Color" />
              <Input name="price" type="number" step="0.01" defaultValue={v.price === null ? "" : String(v.price)} placeholder="Price" />
              <Input name="stock" type="number" defaultValue={String(v.stock)} placeholder="Stock" />
              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeVariant.mutate(v.id)}>
                  Delete
                </Button>
              </div>
            </form>
          ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            saveVariant.mutate({
              values: {
                name: String(form.get("name") ?? ""),
                size: String(form.get("size") ?? "") || null,
                color: String(form.get("color") ?? "") || null,
                stock: Number(form.get("stock") ?? 0),
                position: p.product_variants.length,
              },
            });
            e.currentTarget.reset();
          }}
          className="grid gap-3 sm:grid-cols-6"
        >
          <Input name="name" placeholder="New variant name" required />
          <Input name="size" placeholder="Size" />
          <Input name="color" placeholder="Color" />
          <div />
          <Input name="stock" type="number" placeholder="Stock" defaultValue="0" />
          <Button type="submit" variant="outline" size="sm">
            Add variant
          </Button>
        </form>
      </section>
    </div>
  );
}
