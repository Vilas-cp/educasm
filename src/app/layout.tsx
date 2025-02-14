import { UserProvider } from "./providers";
import { GoogleTagManager } from "@/components/shared/GoogleTagManager";
import "@/styles/globals.css";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <UserProvider>
        <Suspense fallback={null}>
          <GoogleTagManager /> 
          </Suspense>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
