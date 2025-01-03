import React from "react";
import { motion } from "framer-motion";
import { Button } from "@headlessui/react";
import axiosInstance from "../../../../axios.config";
import PackageForm from "./PackageForm";
import API_ENDPOINTS from "../../../../api/endpoints"; // Import API_ENDPOINTS


interface AdminPackageCardProps {
  package: {
    _id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  };
  index: number;
  onUpdate: (updatedPackages: any) => void;
  onDelete: (deletedPackageId: string) => void;
}

const AdminPackageCard: React.FC<AdminPackageCardProps> = ({
  package: pkg,
  index,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.PACKAGES.GET_PACKAGES}${pkg._id}`);
      if (response.data.success) {
        onDelete(pkg._id);
      }
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
    >

      <div className="relative h-56">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {pkg.name}
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {pkg.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
            <span className="text-xl font-semibold text-primary dark:text-primary-light">
              ${pkg.price.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {isEditing && (
        <PackageForm
          pkg={pkg}
          onSuccess={(updatedPackages) => {
            onUpdate(updatedPackages);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </motion.div>
  );
};

export default AdminPackageCard;