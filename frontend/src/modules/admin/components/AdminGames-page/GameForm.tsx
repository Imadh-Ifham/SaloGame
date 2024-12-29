// components/GameForm.tsx
import React, { Fragment, useState } from "react";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import axiosInstance from "../../../../axios.config";

interface Game {
  _id: string;
  image: string;
  name: string;
  rating: number;
  description: string;
}

interface GameFormProps {
  initialData?: Partial<Game>;
  onSuccess: (game: Game) => void;
  onCancel: () => void;
}

const GameForm: React.FC<GameFormProps> = ({
  initialData = {},
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [rating, setRating] = useState(initialData.rating || 0);
  const [image, setImage] = useState(initialData.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isEditMode = !!initialData._id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!name || !description || !image) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      let response;
      if (isEditMode && initialData._id) {
        // Update existing game
        response = await axiosInstance.put(`/games/${initialData._id}`, {
          name,
          description,
          rating,
          image,
        });
      } else {
        // Create new game
        response = await axiosInstance.post("/games", {
          name,
          description,
          rating,
          image,
        });
      }

      if (response.data.success) {
        onSuccess(response.data.data);
      } else {
        setError(response.data.message || "Failed to create the game.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData._id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/games/${initialData._id}`);
      if (response.data.success) {
        onSuccess(response.data.data);
      } else {
        setError(response.data.message || "Failed to delete the game.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="bg-transparent p-0 font-poppins rounded-lg shadow-none">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1  block dark:bg-black w-full border border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Description<span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border dark:bg-black border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
            rows={4}
            required
          ></textarea>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Rating
          </label>
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-1 block w-full border dark:bg-black border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
            min={0}
            max={5}
            step={0.1}
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Image URL<span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 block w-full border dark:bg-black border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          {isEditMode && (
            <Button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-gamer-green text-white rounded hover:bg-gamer-green transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isEditMode ? "Update Game" : "Create Game"}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      {isEditMode && (
        <Transition appear show={isDeleteDialogOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setIsDeleteDialogOpen(false)}
          >
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
            </TransitionChild>

            <div className="flex items-center justify-center min-h-screen px-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-4"
              >
                <DialogPanel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg border-2 border-gamer-green">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Confirm Deletion
                  </DialogTitle>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Are you sure you want to delete this game? This action
                      cannot be undone.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-2">
                    <Button
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(false)}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </Button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default GameForm;
