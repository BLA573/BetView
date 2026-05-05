import HeroSection from "@/components/landing/HeroSection";
import DemoSection from "@/components/landing/DemoSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import AgenciesSection from "@/components/landing/AgenciesSection";
import BookingForm from "@/components/landing/BookingForm";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <main className="overflow-x-hidden page-transition">
      <HeroSection />
      <DemoSection />
      <ProblemSection />
      <SolutionSection />
      <AgenciesSection />
      <BookingForm />
      <FooterSection />
    </main>
  );
};

export default Index;
