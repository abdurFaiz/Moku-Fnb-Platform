import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";

import { useCartMigration } from "@/features/cart/hooks/useCartMigration";
import { router } from "@/routes/routes";
import { Toaster } from "@/components/ui/sonner";

export default function AppRoutes() {
  useCartMigration();

  return (
    <>
      <Suspense
        fallback={
          null
        }
      >
        <RouterProvider router={router} />
      </Suspense>
      <Toaster richColors position="top-center" />
    </>
  );
}
