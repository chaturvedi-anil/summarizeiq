import HeroSection from "@/components/home/HeroSection";
import BgGradient from "@/components/common/BgGradient";
import DemoSection from "@/components/home/DemoSection";
import WorkingSection from "@/components/home/WorkingSection";

export default function Home() {
  return (
    <div className="relative w-full">
      <BgGradient />
      <div className="flex flex-col">
        <HeroSection />
        <DemoSection />
        <WorkingSection />
      </div>

      {/* <PricingSection /> */}
      {/* <CTASection /> */}
    </div>
  );
}
