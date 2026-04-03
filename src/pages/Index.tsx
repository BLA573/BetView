import HeroSection from "@/components/landing/HeroSection";
import DemoSection from "@/components/landing/DemoSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import BrowseSection from "@/components/landing/BrowseSection";
import AgenciesSection from "@/components/landing/AgenciesSection";
import BookingForm from "@/components/landing/BookingForm";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <DemoSection />
      <ProblemSection />
      <SolutionSection />
      <BrowseSection />
      <AgenciesSection />
      <BookingForm />
      <FooterSection />
    </main>
  );
};

export default Index;
