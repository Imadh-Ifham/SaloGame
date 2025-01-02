// src/pages/MembershipPage.tsx

import React, { useState, useEffect } from "react";
import HomeLayout from "../layout/HomeLayout";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import axiosInstance from "@/axios.config";
import MembershipSkeleton from "../components/membershipSkeleton";

// Map the priority to the neon color scheme
const neonColorMapping: Record<
  number,
  { firstColor: string; secondColor: string }
> = {
  1: { firstColor: "#D39D55", secondColor: "#D39D55" }, // Celestial Overlord
  2: { firstColor: "#00FF8E", secondColor: "#00D1B2" }, // Nova Knight
  3: { firstColor: "#5B5B5B", secondColor: "#9E9E9E" }, // Shadow Squire
};

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
  const [tiers, setTiers] = useState<any[]>([]); // Ensure initial state is an array
  const [currentIndex, setCurrentIndex] = useState(0); // State for mobile view
  const [loading, setLoading] = useState(true); // State to track loading
  const [error, setError] = useState<string | null>(null);

  // Fetch memberships on component mount
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axiosInstance.get("/memberships?isActive=true");
        if (Array.isArray(response.data)) {
          setTiers(response.data); // Only update state if it's an array
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (error: any) {
        console.error("Failed to fetch memberships:", error);
        setError("Failed to load memberships. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tiers.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? tiers.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <HomeLayout>
        <div className="flex flex-col items-center justify-center py-0 my-44">
          <MembershipSkeleton count={3} /> {/* Pass dynamic count here */}
        </div>
      </HomeLayout>
    );
  }

  if (error) {
    return (
      <HomeLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </HomeLayout>
    );
  }

  if (tiers.length === 0) {
    return (
      <HomeLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg text-text-secondary dark:text-gray-300">
            No memberships available. Please try again later.
          </p>
        </div>
      </HomeLayout>
    );
  }

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

        {/* Desktop: Show all tiers in a grid */}
        <div className="hidden md:grid grid-cols-3 gap-8 px-4 sm:px-8 w-full max-w-7xl">
          {tiers.map((tier) => (
            <NeonGradientCard
              key={tier._id}
              className="w-full max-w-sm flex"
              neonColors={neonColorMapping[tier.priority]}
              borderSize={1}
              borderRadius={25}
            >
              <div className="flex flex-col h-full w-full p-6 justify-between">
                <div>
                  <h3 className="text-3xl font-extrabold text-text-primary dark:text-white">
                    {tier.name}
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
                  <ul className="mt-4 space-y-2">
                    {tier.benefits.map((benefit: string, index: number) => (
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
                <div className="mt-6">
                  <button type="button" className={subscribeButtonClasses}>
                    Subscribe
                  </button>
                </div>
              </div>
            </NeonGradientCard>
          ))}
        </div>

        {/* Mobile: Show one tier at a time */}
        <div className="block md:hidden w-full max-w-7xl px-4 sm:px-8">
          <div className="relative flex items-center justify-center">
            <button
              onClick={handlePrev}
              className="absolute left-0 p-2 text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform"
            >
              ◀
            </button>
            <NeonGradientCard
              key={tiers[currentIndex]._id}
              className="w-full max-w-sm flex"
              neonColors={neonColorMapping[tiers[currentIndex].priority]}
              borderSize={1}
              borderRadius={25}
            >
              <div className="flex flex-col h-full w-full p-6 justify-between">
                <div>
                  <h3 className="text-3xl font-extrabold text-text-primary dark:text-white">
                    {tiers[currentIndex].name}
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
                  <ul className="mt-4 space-y-2">
                    {tiers[currentIndex].benefits.map(
                      (benefit: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-text-secondary dark:text-gray-300"
                        >
                          <span className="mr-2 text-gamer-green">✔</span>
                          {benefit}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="mt-6">
                  <button type="button" className={subscribeButtonClasses}>
                    Subscribe
                  </button>
                </div>
              </div>
            </NeonGradientCard>
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
