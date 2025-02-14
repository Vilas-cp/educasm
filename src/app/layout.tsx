import { UserProvider } from "./providers";
import { GoogleTagManager } from "@/components/shared/GoogleTagManager";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <UserProvider>
          <GoogleTagManager /> 
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
