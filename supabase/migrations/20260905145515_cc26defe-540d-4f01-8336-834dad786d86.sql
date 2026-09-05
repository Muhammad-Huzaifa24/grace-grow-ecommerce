CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1000;

CREATE OR REPLACE FUNCTION public.apply_stock_on_order_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE remaining integer;
BEGIN
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE public.product_variants SET stock = stock - NEW.quantity
    WHERE id = NEW.variant_id RETURNING stock INTO remaining;
    IF remaining IS NOT NULL AND remaining < 0 THEN
      RAISE EXCEPTION 'Not enough stock for %', NEW.product_name;
    END IF;
  END IF;
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products SET stock = GREATEST(stock - NEW.quantity, 0)
    WHERE id = NEW.product_id AND stock IS NOT NULL RETURNING stock INTO remaining;
  END IF;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.apply_stock_on_order_item() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS order_items_apply_stock ON public.order_items;
CREATE TRIGGER order_items_apply_stock
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.apply_stock_on_order_item();

CREATE OR REPLACE FUNCTION public.issue_invoice_on_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status IS DISTINCT FROM 'paid'
     AND NOT EXISTS (SELECT 1 FROM public.invoices WHERE order_id = NEW.id) THEN
    INSERT INTO public.invoices (order_id, number, total, currency)
    VALUES (NEW.id, 'INV-' || nextval('public.invoice_number_seq'), NEW.total, NEW.currency);
  END IF;
  RETURN NEW;
END; $$;

REVOKE ALL ON FUNCTION public.issue_invoice_on_paid() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS orders_issue_invoice ON public.orders;
CREATE TRIGGER orders_issue_invoice
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.issue_invoice_on_paid();