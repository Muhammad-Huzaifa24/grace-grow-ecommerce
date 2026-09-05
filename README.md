# Epsilon Store

Build a modern full-stack single-store e-commerce web application inspired by the simplicity and usability of Shopify stores, but DO NOT clone Shopify.

Tech:

Next.js + TypeScript

Tailwind CSS + shadcn/ui

Supabase PostgreSQL, Auth and Storage

Responsive desktop/mobile UI

Clean reusable component architecture

There are two sides:

PUBLIC STOREFRONT
Create Homepage, Shop, Categories, Product Details, Search, Filters, Cart, Checkout, Login/Register, Customer Account, Order History and Order Details.

Products must support:
name, slug, description, category, images, price, compare-at price, SKU, stock, variants such as size/color, active/inactive status and featured status.

ADMIN PORTAL
Create a protected /admin dashboard where administrators can:

create/edit/delete products

manage categories

manage variants and inventory

publish/unpublish products

mark products as featured

view customers

view/manage orders

change order status

view payment status

manage homepage banners

edit basic store settings

Design the database properly for:
profiles, addresses, products, product_variants, categories, product_images, carts, cart_items, orders, order_items, payments, invoices and store_settings.

Use role-based authorization so normal customers can NEVER access admin functionality.

For now, create the architecture, database, authentication, storefront UI and admin CRUD.

DO NOT implement advanced Shopify features, multi-vendor functionality, subscriptions, multi-store support or unnecessary complexity.

Use realistic demo data and make the design professional, minimal, premium and suitable for a real production e-commerce store.

Before implementing anything large, preserve a modular architecture so Stripe payments, webhooks, invoicing and transactional email can be added in the next development stage.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://grace-grow-ecommerce.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a0e7437b-edad-4001-9653-0f4190ebd11e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
