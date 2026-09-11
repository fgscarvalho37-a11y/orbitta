import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050914] text-white">
      <Header />
      <Hero />
      <ProductShowcase />
    </main>
  );
}