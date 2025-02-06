import axiosInstance from "@/axios.config";
import Marquee from "@/components/ui/marquee";
import { ClipboardIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import HomeLayout from "../../layout/HomeLayout";

// OfferCard Component
const OfferCard = ({
  title,
  code,
  discountType,
  discountValue,
}: {
  title: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDiscount = () => {
    return discountType === "percentage"
      ? `${discountValue}% OFF`
      : `$${discountValue} OFF`;
  };

  return (
    <div className="relative bg-emerald-900 text-white text-center py-6 px-6 sm:px-10 rounded-xl shadow-md md:min-w-96 w-full sm:w-2/3 lg:w-1/3 max-w-sm mx-auto sm:mx-4 my-4">
      {/* Circular Cutouts */}
      <div className="absolute top-1/2 left-0 -ml-5 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full pattern-dots pattern-green-200 dark:pattern-green-950 pattern-bg-white dark:pattern-bg-black pattern-size-2 pattern-opacity-100"></div>
      <div className="absolute top-1/2 right-0 -mr-5 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-transparent pattern-dots pattern-green-200 dark:pattern-green-950 pattern-bg-white dark:pattern-bg-black pattern-size-2 pattern-opacity-100"></div>

      <h3 className="text-base sm:text-lg font-semibold mb-3">{title}</h3>
      <p className="text-2xl font-bold text-yellow-400 mb-3">
        {formatDiscount()}
      </p>
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span className="border-dashed border font-press text-white px-2 sm:px-3 py-1 rounded-l text-xs sm:text-sm">
          {code}
        </span>
        <button
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
    </div>
  );
};

// General Offers Page Component
const General: React.FC = () => {
  interface Offer {
    _id: string;
    title: string;
    code: string;
    category: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  }

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axiosInstance.get<{
          success: boolean;
          data: Offer[];
        }>("/offer?isActive=true");

        if (response.data.success) {
          setOffers(response.data.data);
        }
      } catch (error) {
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

  // Filter general offers
  const generalOffers = offers.filter((offer) => offer.category === "general");

  if (generalOffers.length === 0) {
    return (
      <HomeLayout>
        <div className="flex items-center justify-center py-16">
          <p className="text-xl text-gray-700">
            No general offers available at the moment.
          </p>
        </div>
      </HomeLayout>
    );
  }

  // Split offers for two rows
  const firstRow = generalOffers.slice(0, Math.ceil(generalOffers.length / 2));
  const secondRow = generalOffers.slice(Math.ceil(generalOffers.length / 2));

  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center py-10 my-7 overflow-hidden">
        <h2 className="text-3xl sm:text-2xl font-press font-normal mb-4 text-primary">
          General <span className="text-gray-900 dark:text-white">Offers</span>
        </h2>
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((offer) => (
            <OfferCard
              key={offer._id}
              title={offer.title}
              code={offer.code}
              discountType={offer.discountType}
              discountValue={offer.discountValue}
            />
          ))}
        </Marquee>
        {secondRow.length > 0 && (
          <Marquee reverse pauseOnHover className="[--duration:20s] mt-6">
            {secondRow.map((offer) => (
              <OfferCard
                key={offer._id}
                title={offer.title}
                code={offer.code}
                discountType={offer.discountType}
                discountValue={offer.discountValue}
              />
            ))}
          </Marquee>
        )}
      </div>
    </HomeLayout>
  );
};

export default General;
