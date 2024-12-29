import { ClipboardIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Marquee from "@/components/ui/marquee";
import HomeLayout from "../layout/HomeLayout";

const offers = [
  {
    name: "Free Hour",
    description: "Get 1 free hour for bookings over 5 hours",
    code: "FREEHOUR",
    expiry: "Valid Till: 31Dec, 2024",
  },
  {
    name: "Weekend Special",
    description: "15% off on weekend gaming for groups of 3 or more (Fri-Sun)",
    code: "WEEKEND15",
    expiry: "Valid Till: 15Jan, 2025",
  },
  {
    name: "Night Gaming Deal",
    description: "Flat LKR 500 off for bookings between midnight and 6 AM",
    code: "NIGHT500",
    expiry: "Valid Till: 31Dec, 2024",
  },
  {
    name: "Student Special",
    description:
      "Get 20% off on gaming hours with a valid Sri Lankan student ID",
    code: "STUDENT20",
    expiry: "Valid Till: 5Mar, 2025",
  },
  {
    name: "Team Play Discount",
    description: "10% off for team bookings of 4 or more players on weekdays",
    code: "TEAMPLAY10",
    expiry: "Valid Till: 10Feb, 2025",
  },
  {
    name: "Loyal Gamer",
    description:
      "Earn LKR 1000 credit for every LKR 10,000 spent on gaming sessions",
    code: "LOYAL1000",
    expiry: "Valid Till: 31Jan, 2025",
  },
];

const firstRow = offers.slice(0, offers.length / 2);
const secondRow = offers.slice(offers.length / 2);

const OfferCard = ({
  description,
  code,
  expiry,
}: {
  name: string;
  description: string;
  code: string;
  expiry: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-emerald-900 text-white text-center py-6 px-10 rounded-xl shadow-md w-1/3 mx-4 my-4">
      {/* Transparent Circular Cutouts */}
      <div
        className="absolute top-1/2 left-0 -ml-5 transform -translate-y-1/2 w-10 h-10 rounded-full pattern-dots pattern-green-200 dark:pattern-green-950 pattern-bg-white dark:pattern-bg-black
                    pattern-size-2 pattern-opacity-100 "
      ></div>
      <div
        className="absolute top-1/2 right-0 -mr-5 transform -translate-y-1/2 w-10 h-10 rounded-full bg-transparent pattern-dots pattern-green-200 dark:pattern-green-950 pattern-bg-white dark:pattern-bg-black
                    pattern-size-2 pattern-opacity-100 "
      ></div>

      {/* Offer Card Content */}
      <h3 className="text-lg font-semibold mb-3 leading-snug">{description}</h3>
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span
          id="cpnCode"
          className="border-dashed border font-press text-white px-3 py-1 rounded-l text-sm"
        >
          {code}
        </span>
        <button
          id="cpnBtn"
          onClick={handleCopy}
          className="border border-white bg-white text-green-950 px-3 py-1 rounded-r cursor-pointer flex items-center space-x-1 text-sm"
        >
          {copied ? (
            <span>Copied!</span>
          ) : (
            <>
              <ClipboardIcon className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <p className="text-xs">{expiry}</p>
    </div>
  );
};

const OffersPage: React.FC = () => {
  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center py-16 overflow-hidden">
        {/* First Row of Offers */}
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((offer) => (
            <OfferCard key={offer.name} {...offer} />
          ))}
        </Marquee>
        {/* Second Row of Offers (Reverse Direction) */}
        <Marquee reverse pauseOnHover className="[--duration:20s] mt-6">
          {secondRow.map((offer) => (
            <OfferCard key={offer.name} {...offer} />
          ))}
        </Marquee>
      </div>
    </HomeLayout>
  );
};

export default OffersPage;
