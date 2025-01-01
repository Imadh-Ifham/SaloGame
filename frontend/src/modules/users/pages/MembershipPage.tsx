import React, { useState } from "react";
import HomeLayout from "../layout/HomeLayout";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";

interface Tier {
  title: string;
  tagline: string;
  neonColors: { firstColor: string; secondColor: string };
  benefits: string[];
  price: string;
}

const tiers: Tier[] = [
  {
    title: "Shadow Squire",
    tagline: "Step into the shadows and sharpen your skills",
    neonColors: { firstColor: "#5B5B5B", secondColor: "#9E9E9E" },
    benefits: [
      "Earn 10 XP for every LKR1000 spent on bookings",
      "2 Free Hour of PC/Console time per month",
      "Standard Lounge Access",
    ],
    price: "499",
  },
  {
    title: "Nova Knight",
    tagline: "Radiate power and conquer new challenges",
    neonColors: { firstColor: "#00FF8E", secondColor: "#00D1B2" },
    benefits: [
      "Earn 20 XP for every LKR1000 spent on bookings",
      "5 Free Hours of PC/Console time per month",
      "Priority Booking for Premium Stations",
      "Discounted Café & Snack Bar",
    ],
    price: "999",
  },
  {
    title: "Celestial Overlord",
    tagline: "Ascend to the heavens and rule the galaxy",
    neonColors: { firstColor: "#D39D55", secondColor: "#D39D55" },
    benefits: [
      "Earn 30 XP for every LKR1000 spent on bookings",
      "8 Free Hours of PC/Console time per month",
      "Exclusive VIP Room Access",
      "24/7 Dedicated Support & Priority Reservations",
      "Special Tournament Invitations",
    ],
    price: "1499",
  },
];

// Isolate this long Tailwind string for clarity and reuse
const subscribeButtonClasses = `
  w-full 
  inline-flex 
  items-center 
  justify-center 
  relative 
  overflow-hidden 
  cursor-pointer 
  transition-all 
  duration-500
  font-bold
  uppercase
  text-sm
  [--color:#00A97F]
  text-[var(--color)]
  border
  border-current
  px-6
  py-3
  rounded-md
  shadow-sm
  focus:outline-none
  focus:ring-2
  focus:ring-primary
  focus:ring-offset-2
  z-[1]

  before:content-['']
  before:block
  before:absolute
  before:h-[50px]
  before:w-[50px]
  before:rounded-full
  before:bg-[var(--color)]
  before:z-[-1]
  before:transition-all
  before:duration-700
  before:ease-linear
  before:[transform:translate(-50%,_-50%)]
  before:[top:-1em]
  before:[left:-1em]

  after:content-['']
  after:block
  after:absolute
  after:h-[50px]
  after:w-[50px]
  after:rounded-full
  after:bg-[var(--color)]
  after:z-[-1]
  after:transition-all
  after:duration-700
  after:ease-linear
  after:[transform:translate(-50%,_-50%)]
  after:[left:calc(100%_+_1em)]
  after:[top:calc(100%_+_1em)]

  hover:before:h-[410px]
  hover:before:w-[410px]
  hover:after:h-[410px]
  hover:after:w-[410px]
  hover:text-[rgb(10,25,30)]
  active:[filter:brightness(0.8)]
`;

const MembershipPage: React.FC = () => {
  // State to track which tier is currently displayed on mobile
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tiers.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? tiers.length - 1 : prev - 1));
  };

  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center py-0 my-20">
        {/* Page Header */}
        <h2 className="text-2xl font-press mb-4 text-center text-text-primary dark:text-white tracking-wide">
          Choose Your Ultimate Gaming Tier
        </h2>

        <p className="text-sm text-text-secondary dark:text-gray-300 mb-12 text-center px-4">
          Power up your experience with exclusive rewards, loot boxes, and XP
          boosts.
        </p>

        {/* 
          Desktop: Show all 3 tiers in a grid 
          ------------------------------------------------
        */}
        <div className="hidden md:grid grid-cols-3 gap-8 px-4 sm:px-8 w-full max-w-7xl">
          {tiers.map((tier) => (
            <NeonGradientCard
              key={tier.title}
              className="w-full max-w-sm flex"
              neonColors={tier.neonColors}
              borderSize={1}
              borderRadius={25}
            >
              <div className="flex flex-col h-full w-full p-6 justify-between">
                {/* Top Content */}
                <div>
                  <h3 className="text-3xl font-extrabold text-text-primary dark:text-white">
                    {tier.title}
                  </h3>

                  {tier.tagline && (
                    <p className="mt-1 text-sm italic text-text-secondary dark:text-gray-300">
                      {tier.tagline}
                    </p>
                  )}

                  <p className="mt-4 text-2xl font-semibold text-text-primary dark:text-gray-100">
                    <span className="text-sm">LKR </span>
                    {tier.price}
                    <span className="text-sm"> / month</span>
                  </p>

                  {/* Benefits */}
                  <ul className="mt-4 space-y-2">
                    {tier.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-text-secondary dark:text-gray-300"
                      >
                        <span className="mr-2 text-gamer-green">✔</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom (Button) */}
                <div className="mt-6">
                  <button type="button" className={subscribeButtonClasses}>
                    Subscribe
                  </button>
                </div>
              </div>
            </NeonGradientCard>
          ))}
        </div>

        {/* 
          Mobile: Show one tier at a time with left & right arrows 
          ------------------------------------------------
        */}
        <div className="block md:hidden w-full max-w-7xl px-4 sm:px-8">
          {/* Arrows + Single Card Container */}
          <div className="relative flex items-center justify-center">
            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-0 p-2 text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform"
            >
              ◀
            </button>

            {/* Single Tier Card */}
            <NeonGradientCard
              key={tiers[currentIndex].title}
              className="w-full max-w-sm flex"
              neonColors={tiers[currentIndex].neonColors}
              borderSize={1}
              borderRadius={25}
            >
              <div className="flex flex-col h-full w-full p-6 justify-between">
                {/* Top Content */}
                <div>
                  <h3 className="text-3xl font-extrabold text-text-primary dark:text-white">
                    {tiers[currentIndex].title}
                  </h3>

                  {tiers[currentIndex].tagline && (
                    <p className="mt-1 text-sm italic text-text-secondary dark:text-gray-300">
                      {tiers[currentIndex].tagline}
                    </p>
                  )}

                  <p className="mt-4 text-2xl font-semibold text-text-primary dark:text-gray-100">
                    <span className="text-sm">LKR </span>
                    {tiers[currentIndex].price}
                    <span className="text-sm"> / month</span>
                  </p>

                  {/* Benefits */}
                  <ul className="mt-4 space-y-2">
                    {tiers[currentIndex].benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-text-secondary dark:text-gray-300"
                      >
                        <span className="mr-2 text-gamer-green">✔</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom (Button) */}
                <div className="mt-6">
                  <button type="button" className={subscribeButtonClasses}>
                    Subscribe
                  </button>
                </div>
              </div>
            </NeonGradientCard>

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-0 p-2 text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default MembershipPage;
