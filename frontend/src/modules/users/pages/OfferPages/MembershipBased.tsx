import axiosInstance from "@/axios.config";
import Marquee from "@/components/ui/marquee";
import { ClipboardIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import HomeLayout from "../../layout/HomeLayout";

// OfferCard component for displaying individual offers
const OfferCard = ({
  title,
  code,
}: {
  title: string;
  code: string;
  endDateTime: string;
}) => {
  const [copied, setCopied] = useState(false);

  // Copy coupon code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-emerald-900 text-white text-center py-6 px-6 sm:px-10 rounded-xl shadow-md md:min-w-96 w-full sm:w-2/3 lg:w-1/3 max-w-sm mx-auto sm:mx-4 my-4">
      {/* Circular Cutouts */}
      <div className="absolute top-1/2 left-0 -ml-5 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full pattern-dots pattern-green-200 dark:pattern-green-950 pattern-bg-white dark:pattern-bg-black pattern-size-2 pattern-opacity-100"></div>
      <div className="absolute top-1/2 right-0 -mr-5 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-transparent pattern-dots pattern-green-200 dark:pattern-green-950 pattern-bg-white dark:pattern-bg-black pattern-size-2 pattern-opacity-100"></div>

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
    </div>
  );
};

// MembershipBased Component
const MembershipBased = () => {
  interface Offer {
    _id: string;
    title: string;
    code: string;
    endDateTime: string;
    category: string;
    membershipType: string;
  }

  const [offers, setOffers] = useState<Offer[]>([]);
  const [userOffers, setUserOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMembershipId, setUserMembershipId] = useState<string | null>(null);

  // Fetch user's membership type
  useEffect(() => {
    const fetchUserMembership = async () => {
      try {
        const response = await axiosInstance.get<{ _id: string }>(
          "/memberships/current"
        );
        if (response.data) {
          setUserMembershipId(response.data._id);
        }
      } catch (error) {
        console.error("Error fetching user membership:", error);
      }
    };

    fetchUserMembership();
  }, []);

  // Fetch all offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axiosInstance.get<{
          success: boolean;
          data: Offer[];
        }>("/offer?isActive=true");

        if (response.data && response.data.success) {
          const allOffers = response.data.data;
          setOffers(allOffers);
          console.log("All offers:", allOffers);

          // Filter offers for user's membership type
          if (userMembershipId) {
            const userSpecificOffers = allOffers.filter(
              (offer) => offer.membershipType === userMembershipId
            );
            console.log("User membership ID:", userMembershipId);
            console.log("User specific offers:", userSpecificOffers);

            setUserOffers(userSpecificOffers);
          }
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [userMembershipId]);

  // Filter and split general membership offers
  const filteredOffers = offers.filter(
    (offer) => offer.category === "membership-based"
  );
  const firstRow = filteredOffers.slice(
    0,
    Math.ceil(filteredOffers.length / 2)
  );
  const secondRow = filteredOffers.slice(Math.ceil(filteredOffers.length / 2));

  // Split user-specific offers
  const userFirstRow = userOffers.slice(0, Math.ceil(userOffers.length / 2));
  const userSecondRow = userOffers.slice(Math.ceil(userOffers.length / 2));

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

  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center py-10 my-7 overflow-hidden">
        {/* Available for You Section */}
        {userOffers.length > 0 && (
          <>
            <h2 className="text-3xl sm:text-2xl font-press font-normal mb-4 text-primary">
              Available for{" "}
              <span className="text-gray-900 dark:text-white">You</span>
            </h2>
            <Marquee pauseOnHover className="[--duration:20s]">
              {userFirstRow.map((offer) => (
                <OfferCard
                  key={offer._id}
                  title={offer.title}
                  code={offer.code}
                  endDateTime={offer.endDateTime}
                />
              ))}
            </Marquee>
            {userSecondRow.length > 0 && (
              <Marquee reverse pauseOnHover className="[--duration:20s] mt-6">
                {userSecondRow.map((offer) => (
                  <OfferCard
                    key={offer._id}
                    title={offer.title}
                    code={offer.code}
                    endDateTime={offer.endDateTime}
                  />
                ))}
              </Marquee>
            )}
          </>
        )}
        {/* All Membership Offers Section */}
        <h2 className="text-3xl sm:text-2xl font-press font-normal mb-4 text-primary">
          Membership{" "}
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

export default MembershipBased;
