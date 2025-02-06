import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@headlessui/react";
import axiosInstance from "../../../axios.config";

import Modal from "../../../components/Modal";
import AdminPackageCard from "../components/AdminPackages-page/AdminPackageCard";
import PackageForm from "../components/AdminPackages-page/PackageForm";

import { Package } from "../../../types/package";
import API_ENDPOINTS from "../../../api/endpoints"; // Import API_ENDPOINTS

const AdminPackagePage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch packages on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.PACKAGES.GET_PACKAGES
        );
        console.log("Packages API Response:", response);
        if (response.data.success) {
          setPackages(response.data.data);
          console.log("Packages data:", response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch packages.");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Handle responsive screen size
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

  // Determine visible packages based on screen size and "showMore" state
  const visiblePackages = (() => {
    if (showMore) return packages;
    if (screenSize === "desktop") return packages;
    if (screenSize === "tablet") return packages.slice(0, 4);
    return packages.slice(0, 2);
  })();

  const showMoreButton = screenSize === "mobile" || screenSize === "tablet";

  // Handlers for Create, Edit, Delete
  const handleCreatePackage = (newPackage: Package) => {
    if (!newPackage._id) {
      console.error("Received package without _id:", newPackage);
      return;
    }
    setPackages((prevPackages) => [newPackage, ...prevPackages]);
  };

  const handleUpdatePackage = (updatedPackage: Package) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg) =>
        pkg._id === updatedPackage._id ? updatedPackage : pkg
      )
    );
  };

  const handleDeletePackage = (deletedPackageId: string) => {
    setPackages((prevPackages) =>
      prevPackages.filter((pkg) => pkg._id !== deletedPackageId)
    );
  };

  return (
    <section>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto text-center mb-12 sm:mb-16 flex justify-between items-center"
        >
          <div>
            <h2 className="text-3xl sm:text-2xl font-press font-semibold mb-4 text-primary">
              Manage Our{" "}
              <span className="text-gray-900 dark:text-white">Packages</span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-gamer-green text-white rounded-lg hover:bg-gamer-green transition-all duration-300"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Package
          </Button>
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
          // Package Cards
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 mt-16">
            {visiblePackages.map((pkg, index) => (
              <AdminPackageCard
                key={pkg._id}
                package={pkg}
                index={index}
                onUpdate={handleUpdatePackage}
                onDelete={handleDeletePackage}
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

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Package"
        >
          <PackageForm
            onSuccess={(pkg: Package) => {
              handleCreatePackage(pkg);
              setIsCreateModalOpen(false);
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>
      </div>
    </section>
  );
};

export default AdminPackagePage;
