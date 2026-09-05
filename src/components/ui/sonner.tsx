import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-lg !border-border !bg-card !text-card-foreground !shadow-2xl",
          title: "!font-sans !text-sm !font-medium !text-card-foreground",
          description: "!text-muted-foreground",
          icon: "!text-primary",
          success: "!border-success/40",
          error: "!border-destructive/50",
          actionButton: "!rounded-md !bg-primary !text-primary-foreground",
          cancelButton: "!rounded-md !bg-muted !text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
