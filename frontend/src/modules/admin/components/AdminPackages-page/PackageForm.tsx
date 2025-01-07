import React, { useState } from "react";
import { Button } from "@headlessui/react";
import axiosInstance from "../../../../axios.config";
import { Package, NewPackage } from '../../../../types/package';
import API_ENDPOINTS from "../../../../api/endpoints"; // Import API_ENDPOINTS

interface PackageFormProps {
  pkg?: Package;
  onSuccess: (pkg: Package) => void;
  onCancel: () => void;
}

const PackageForm: React.FC<PackageFormProps> = ({
  pkg: initialPackage,
  onSuccess,
  onCancel,
}) => {
  const [pkg, setPkg] = useState<NewPackage>(
    initialPackage ? {
      name: initialPackage.name,
      price: initialPackage.price,
      image: initialPackage.image,
      description: initialPackage.description
    } : {
      name: "",
      price: 0,
      image: "",
      description: "",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = initialPackage?._id
        ? await axiosInstance.put(API_ENDPOINTS.PACKAGES.UPDATE_PACKAGE(initialPackage._id), pkg) // Updated endpoint
        : await axiosInstance.post(API_ENDPOINTS.PACKAGES.GET_PACKAGES, pkg);

      onSuccess(response.data.data);
    } catch (error) {
      console.error("Error saving package:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={pkg.name}
          onChange={(e) =>
            setPkg({ ...pkg, name: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          type="number"
          value={pkg.price}
          onChange={(e) =>
            setPkg({ ...pkg, price: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <input
          type="text"
          value={pkg.image}
          onChange={(e) =>
            setPkg({ ...pkg, image: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={pkg.description}
          onChange={(e) =>
            setPkg({ ...pkg, description: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-lg"
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default PackageForm;
