import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
};

export type Variant = {
  id: string;
  name: string;
  size: string | null;
  color: string | null;
  price: number | null;
  stock: number;
  position: number;
};

export type ProductImage = { id: string; url: string; alt: string | null; position: number };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock: number;
  is_featured: boolean;
  category_id: string | null;
  categories: { name: string; slug: string } | null;
  product_images: ProductImage[];
  product_variants: Variant[];
};

const PRODUCT_SELECT =
  "id,name,slug,description,price,compare_at_price,sku,stock,is_featured,category_id,categories(name,slug),product_images(id,url,alt,position),product_variants(id,name,size,color,price,stock,position)";

export function formatPrice(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function normalize(row: any): Product {
  return {
    ...row,
    price: Number(row.price),
    compare_at_price: row.compare_at_price === null ? null : Number(row.compare_at_price),
    product_images: [...(row.product_images ?? [])].sort((a, b) => a.position - b.position),
    product_variants: [...(row.product_variants ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({ ...v, price: v.price === null ? null : Number(v.price) })),
  };
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,description,position")
      .order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const bannersQuery = queryOptions({
  queryKey: ["banners"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("id,title,subtitle,image_url,link_url,position")
      .eq("is_active", true)
      .order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["store-settings"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("store_settings")
      .select("store_name,tagline,support_email,support_phone,currency,shipping_flat_rate,free_shipping_threshold")
      .maybeSingle();
    if (error) throw error;
    return data
      ? {
          ...data,
          shipping_flat_rate: Number(data.shipping_flat_rate),
          free_shipping_threshold: Number(data.free_shipping_threshold),
        }
      : null;
  },
});

export const productsQuery = (opts: { featured?: boolean } = {}) =>
  queryOptions({
    queryKey: ["products", opts],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);
      if (opts.featured) q = q.eq("is_featured", true);
      const { data, error } = await q.order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(normalize);
    },
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data ? normalize(data) : null;
    },
  });

export const ordersQuery = queryOptions({
  queryKey: ["orders"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("id,order_number,status,payment_status,total,currency,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const orderQuery = (id: string) =>
  queryOptions({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id,order_number,status,payment_status,subtotal,shipping,total,currency,shipping_address,notes,created_at,email,order_items(id,product_name,variant_label,image_url,unit_price,quantity)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
