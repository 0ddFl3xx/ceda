import { FeaturedNewsAndFeed, HallOfInnovationSection, LeadershipMessage } from "@/components/landing/LandingContent";
import { HeroSection } from "@/components/landing/HeroSection";

export default function Home() {
  return (
    <main id="main-content" className="flex-1 bg-white">
      <HeroSection />
      <FeaturedNewsAndFeed />
      <LeadershipMessage />
      <HallOfInnovationSection />
    </main>
  );
}
