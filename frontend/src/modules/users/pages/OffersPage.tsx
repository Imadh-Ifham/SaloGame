import axiosInstance from "@/axios.config";
import Marquee from "@/components/ui/marquee";
import { ClipboardIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import HomeLayout from "../layout/HomeLayout";

const OfferCard = ({
  title,
  code,
  endDateTime,
}: {
  title: string;
  code: string;
  endDateTime: string;
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Calculate the time left for the offer to expire
  useEffect(() => {
    const calculateTimeLeft = (endDateTime: string): string => {
      const now = new Date().getTime();
      const endTime = new Date(endDateTime).getTime();

      if (isNaN(endTime)) {
        console.error("Error parsing endDateTime:", endDateTime);
        return "Invalid Offer";
      }

      const difference = endTime - now;

      if (difference <= 0) {
        return "Expired";
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days}d ${hours}h left`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m left`;
      } else if (minutes > 0) {
        return `${minutes}m left`;
      } else {
        return "Less than 1 minute left";
      }
    };

    setTimeLeft(calculateTimeLeft(endDateTime));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDateTime));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [endDateTime]);

  // Copy coupon code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Offer Card JSX
  return (
    <div className="relative bg-emerald-900 text-white text-center py-6 px-6 sm:px-10 rounded-xl shadow-md md:min-w-96 w-full sm:w-2/3 lg:w-1/3 max-w-sm mx-auto sm:mx-4 my-4">
      {/* Circular Cutouts */}
      <div
        className="absolute top-1/2 left-0 -ml-5 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full pattern-dots pattern-green-200 dark:pattern-green-950 pattern-bg-white dark:pattern-bg-black
                    pattern-size-2 pattern-opacity-100"
      ></div>
      <div
        className="absolute top-1/2 right-0 -mr-5 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-transparent pattern-dots pattern-green-200 dark:pattern-green-950 pattern-bg-white dark:pattern-bg-black
                    pattern-size-2 pattern-opacity-100"
      ></div>

      {/* Offer Card Content */}
      <h3 className="text-base sm:text-lg font-semibold mb-3 leading-snug">
        {title}
      </h3>
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span
          id="cpnCode"
          className="border-dashed border font-press text-white px-2 sm:px-3 py-1 rounded-l text-xs sm:text-sm"
        >
          {code}
        </span>
        <button
          id="cpnBtn"
          onClick={handleCopy}
          className="border border-white bg-white text-green-950 px-2 sm:px-3 py-1 rounded-r cursor-pointer flex items-center space-x-1 text-xs sm:text-sm"
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
      <p className="text-xs sm:text-sm">{timeLeft}</p>
    </div>
  );
};

// OffersPage Component
const OffersPage: React.FC = () => {
  interface Offer {
    _id: string;
    title: string;
    code: string;
    endDateTime: string;
  }

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axiosInstance.get<{
          success: boolean;
          data: any[];
        }>("/offer?isActive=true");

        if (response.data && response.data.success) {
          setOffers(response.data.data);
        } else {
          console.error("Backend returned an unsuccessful response:", response);
        }
      } catch (error: any) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
    return (
      <HomeLayout>
        <div className="flex items-center justify-center py-16">
          <p className="text-xl text-gray-700">Loading offers...</p>
        </div>
      </HomeLayout>
    );
  }

  if (offers.length === 0) {
    return (
      <HomeLayout>
        <div className="flex items-center justify-center py-16">
          <p className="text-xl text-gray-700">
            No offers available at the moment.
          </p>
        </div>
      </HomeLayout>
    );
  }

  const userMembership = { _id: 1 }; // Replace with actual user membership data

  const filteredOffers = offers.filter((offer: any) => {
    return offer.membershipType <= userMembership._id;
  });

  const firstRow = offers.slice(0, Math.ceil(offers.length / 2));
  const secondRow = offers.slice(Math.ceil(offers.length / 2));

  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center py-10 my-7 overflow-hidden">
        <h2 className="text-3xl sm:text-2xl font-press font-normal mb-4 text-primary">
          Time Limited{" "}
          <span className="text-gray-900 dark:text-white">Offers</span>
        </h2>
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((offer: any) => (
            <OfferCard
              key={offer._id}
              title={offer.title}
              code={offer.code}
              endDateTime={offer.endDateTime}
            />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s] mt-6">
          {secondRow.map((offer: any) => (
            <OfferCard
              key={offer._id}
              title={offer.title}
              code={offer.code}
              endDateTime={offer.endDateTime}
            />
          ))}
        </Marquee>
      </div>
    </HomeLayout>
  );
};

export default OffersPage;
