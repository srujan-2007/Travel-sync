import React from 'react';
import Hero from './components/Hero/Hero';
import StatsBar from './components/StatsBar/StatsBar';
import Features from './components/Features/Features';
import JourneySection from './components/JourneySection/JourneySection';
import ItinerarySection from './components/ItinerarySection/ItinerarySection';
import TestimonialSection from './components/TestimonialSection/TestimonialSection';
import FooterSection from './components/FooterSection/FooterSection';

function App() {
  return (
    <div className="app">
      <Hero />
      <StatsBar />
      <Features />
      <JourneySection />
      <ItinerarySection />
      <TestimonialSection />
      <FooterSection />
    </div>
  );
}

export default App;
