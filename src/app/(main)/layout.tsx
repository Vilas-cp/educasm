import { Layout } from "@/components/Layout/Layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
