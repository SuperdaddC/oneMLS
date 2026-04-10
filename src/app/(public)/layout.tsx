import type { Metadata } from "next";
import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "OneMLS - The National MLS",
  description: "The independent, national MLS platform for real estate professionals and home buyers.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNav />
      <main className="min-h-screen bg-[#0a0a0f]">{children}</main>
      <Footer />
    </>
  );
}
