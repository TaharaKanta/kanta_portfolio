import HeroSection from "@/components/HeroSection";
import Products from "@/components/Products";
import Skills from "@/components/Skills";

export default function Page() {
  return (
    <main className="px-8">
      <HeroSection />
      <Skills />
      <Products />
    </main>
  );
}
