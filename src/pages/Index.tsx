import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TherapiesSection from "@/components/TherapiesSection";
import CoursesSection from "@/components/CoursesSection";
import AgendaSection from "@/components/AgendaSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TherapiesSection />
      <CoursesSection />
      <AgendaSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
