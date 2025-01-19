import axiosInstance from "@/axios.config";
import Marquee from "@/components/ui/marquee";
import { ClipboardIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../../layout/HomeLayout";
import { Divider } from "antd";
import { SparklesIcon } from "@heroicons/react/24/outline"; // Add this import

interface UserProfile {
  defaultMembershipId: {
    _id: string;
    name: string;
  };
}

// Offer Card without the Copy functionality
const ViewOnlyOfferCard = ({
  title,
  discountType,
  discountValue,
}: {
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
}) => {
  const formatDiscount = () => {
    return discountType === "percentage"
      ? `${discountValue}% OFF`
      : `$${discountValue} OFF`;
  };

  return (
    <div className="relative bg-emerald-900 text-white text-center py-6 px-6 sm:px-10 rounded-xl shadow-md md:min-w-96 w-full sm:w-2/3 lg:w-1/3 max-w-sm mx-auto sm:mx-4 my-4">
      <h3 className="text-base sm:text-lg font-semibold mb-3">{title}</h3>
      <p className="text-2xl font-bold text-yellow-400 mb-3">
        {formatDiscount()}
      </p>
    </div>
  );
};

// OfferCard component
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
          className="border border-white bg-white text-green-950 px-2 sm:px-3 py-1 rounded-r flex items-center space-x-1 text-xs sm:text-sm"
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

// MembershipBased Offers Component
const MembershipBased = () => {
  interface Offer {
    _id: string;
    title: string;
    code: string;
    category: string;
    membershipType: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  }
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMembershipId, setUserMembershipId] = useState<string | null>(null);
  const [membershipType, setMembershipType] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get<UserProfile>("/users/profile");
        if (response.data?.defaultMembershipId?._id) {
          setUserMembershipId(response.data.defaultMembershipId._id);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);
  // Fetch User Membership Type
  useEffect(() => {
    const fetchMembershipType = async () => {
      try {
        const response = await axiosInstance.get<{ name: string }>(
          "/membership/current"
        );
        setMembershipType(response.data.name);
      } catch (error) {
        console.error("Error fetching membership type:", error);
      }
    };

    fetchMembershipType();
  }, []);

  // Fetch Active Offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axiosInstance.get<{
          success: boolean;
          data: Offer[];
        }>("/offer?isActive=true");

        if (response.data.success) {
          const allOffers = response.data.data;
          console.log("Fetched Offers:", allOffers); // Debugging
          // Check if offers have membershipType
          allOffers.forEach((offer) => {
            console.log(
              `Offer ${offer.title} - MembershipType: ${offer.membershipType}`
            );
          });
          setOffers(allOffers);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Filter Offers (Step 1): Only Membership-Based Offers
  const membershipOffers = offers.filter(
    (offer) => offer.category === "membership-based"
  );
  console.log("Membership-Based Offers:", membershipOffers); // Debugging

  // Filter Offers (Step 2): Only for the Logged-in User’s Membership Type
  const userSpecificOffers = membershipOffers.filter(
    (offer) => String(offer.membershipType) === String(userMembershipId)
  );

  console.log("Filtered User Offers:", userSpecificOffers); // Debugging

  const otherMembershipOffers = membershipOffers.filter(
    (offer) => String(offer.membershipType) !== String(userMembershipId)
  );

  // Split Offers for Marquee Rows
  const firstRow = otherMembershipOffers.slice(
    0,
    Math.ceil(otherMembershipOffers.length / 2)
  );
  const secondRow = otherMembershipOffers.slice(
    Math.ceil(otherMembershipOffers.length / 2)
  );

  const userFirstRow = userSpecificOffers.slice(
    0,
    Math.ceil(userSpecificOffers.length / 2)
  );
  const userSecondRow = userSpecificOffers.slice(
    Math.ceil(userSpecificOffers.length / 2)
  );

  if (loading) {
    return (
      <HomeLayout>
        <div className="flex items-center justify-center py-16">
          <p className="text-xl text-gray-700">Loading offers...</p>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center py-10 my-7 overflow-hidden">
        {/* Available for You Section */}
        {userSpecificOffers.length > 0 ? (
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
                  discountType={offer.discountType}
                  discountValue={offer.discountValue}
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
                    discountType={offer.discountType}
                    discountValue={offer.discountValue}
                  />
                ))}
              </Marquee>
            )}
          </>
        ) : (
          <p className="text-gray-700 text-lg font-semibold mb-8">
            No personalized offers available.
          </p>
        )}

        <Divider />
        {/* Membership Offers Section */}
        <h2 className="text-3xl sm:text-2xl font-press font-normal mb-4 text-primary">
          Check Other Membership-based{" "}
          <span className="text-gray-900 dark:text-white">Offers</span>
        </h2>
        {otherMembershipOffers.length > 0 ? (
          <>
            <Marquee pauseOnHover className="[--duration:20s]">
              {firstRow.map((offer) => (
                <ViewOnlyOfferCard
                  key={offer._id}
                  title={offer.title}
                  discountType={offer.discountType}
                  discountValue={offer.discountValue}
                />
              ))}
            </Marquee>
            {secondRow.length > 0 && (
              <Marquee reverse pauseOnHover className="[--duration:20s] mt-6">
                {secondRow.map((offer) => (
                  <ViewOnlyOfferCard
                    key={offer._id}
                    title={offer.title}
                    discountType={offer.discountType}
                    discountValue={offer.discountValue}
                  />
                ))}
              </Marquee>
            )}
          </>
        ) : (
          <p className="text-gray-700 text-lg font-semibold mb-8">
            No other membership offers available.
          </p>
        )}

        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-r from-emerald-500 to-primary">
            <button
              onClick={() => navigate("/memberships")}
              className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-full hover:bg-opacity-90 transition-all duration-300"
            >
              <SparklesIcon className="w-5 h-5 mr-2 animate-pulse" />
              <span>Want to grab these? Upgrade your membership now!</span>
              <span className="absolute -inset-0.5 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300" />
            </button>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default MembershipBased;
