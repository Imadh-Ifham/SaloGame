import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Button } from "@headlessui/react";
import HomeLayout from "../layout/HomeLayout";
import axiosInstance from "../../../axios.config";
import { API_ENDPOINTS } from "../../../api/endpoints";

interface Package {
  _id: string;
  image: string;
  name: string;
  price: number;
  description: string;
}

interface PackageCardProps {
  image: string;
  name: string;
  price: number;
  description: string;
  index: number;
}

const PackageCard: React.FC<PackageCardProps> = ({
  image,
  name,
  price,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex group relative p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-background dark:bg-background-dark border border-border-primary"
    >
      {/* Package Image */}
      <div className="w-1/3 h-40 rounded-lg overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Card Content */}
      <div className="ml-6 flex flex-col justify-between w-2/3">
        <div>
          <h3 className="text-xl font-poppins font-semibold mb-2 text-text-primary">
            {name}
          </h3>
          <p className="text-sm font-poppins text-text-secondary dark:text-neutral-50 mb-4">
            {description}
          </p>
        </div>
        <div className="text-base font-poppins text-green-500">
          ${price.toFixed(2)}
        </div>
      </div>

      {/* Glowing Outline */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-2xl transition-all duration-300" />
    </motion.div>
  );
};

const MembershipPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) setScreenSize("desktop");
      else if (width >= 768) setScreenSize("tablet");
      else setScreenSize("mobile");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.PACKAGES.GET_PACKAGES);
        if (response.data.success) {
          setPackages(response.data.data);
        } else {
          setError("Failed to fetch packages.");
        }
      } catch (err) {
        setError((err as Error).message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const visiblePackages = (() => {
    if (showMore) return packages;
    if (screenSize === "desktop") return packages;
    if (screenSize === "tablet") return packages.slice(0, 4);
    return packages.slice(0, 2);
  })();

  const showMoreButton = screenSize === "mobile" || screenSize === "tablet";

  return (
    <HomeLayout>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-2xl font-press font-normal mb-4 text-primary">
          Our new{" "}
             <span className="text-primary-dark">Packages</span>
            
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Loading packages...
            </p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 mt-16">
            {visiblePackages.map((pkg, index) => (
              <PackageCard
                key={pkg._id}
                image={pkg.image}
                name={pkg.name}
                price={pkg.price}
                description={pkg.description}
                index={index}
              />
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          showMoreButton &&
          packages.length > (screenSize === "mobile" ? 2 : 4) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-8"
            >
              <Button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-all duration-300"
              >
                {showMore ? "Show Less" : "Show More"}
                {showMore ? (
                  <ChevronUpIcon className="w-5 h-5 ml-2" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 ml-2" />
                )}
              </Button>
            </motion.div>
          )}
      </div>
    </HomeLayout>
  );
};

export default MembershipPage;
