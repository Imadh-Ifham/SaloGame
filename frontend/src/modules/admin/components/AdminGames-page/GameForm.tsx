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
  genres: string[]; // Ensure genres are included
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
  const [genres, setGenres] = useState<string[]>(initialData.genres || []);
  const [genreInput, setGenreInput] = useState<string>(""); // For adding new genres
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isEditMode = !!initialData._id;

  // Handle adding a new genre
  const addGenre = () => {
    const trimmedGenre = genreInput.trim();
    if (trimmedGenre && !genres.includes(trimmedGenre)) {
      setGenres([...genres, trimmedGenre]);
    }
    setGenreInput("");
  };

  // Handle removing a genre
  const removeGenre = (genreToRemove: string) => {
    setGenres(genres.filter((genre) => genre !== genreToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isEditMode) {
      // Edit Mode: Validate required fields
      if (!name || !description || genres.length === 0) {
        setError(
          "Please fill in all required fields and add at least one genre."
        );
        setLoading(false);
        return;
      }
    } else {
      // Create Mode: Validate only name
      if (!name) {
        setError("Please provide the game name.");
        setLoading(false);
        return;
      }
    }

    try {
      let response;
      if (isEditMode && initialData._id) {
        // Update existing game
        response = await axiosInstance.put(`/games/${initialData._id}`, {
          name,
          description,
          rating: parseFloat(rating.toFixed(2)), // Ensure two decimal places
          image,
          genres,
        });
      } else {
        // Create new game with only name
        response = await axiosInstance.post("/games", {
          name,
        });
      }

      if (response.data.success) {
        onSuccess(response.data.data);
      } else {
        setError(response.data.message || "Failed to create/update the game.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle deletion (optional, based on user request)
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

        {/* Description (Only in Edit Mode) */}
        {isEditMode && (
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
        )}

        {/* Rating (Only in Edit Mode) */}
        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Rating<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-1 block w-full border dark:bg-black border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
              min={0}
              max={5}
              step={0.01} // Changed from 0.1 to 0.01
              required={isEditMode}
            />
          </div>
        )}

        {/* Image URL (Only in Edit Mode) */}
        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Image URL<span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 block w-full border dark:bg-black border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
              required={isEditMode}
            />
          </div>
        )}

        {/* Genres (Only in Edit Mode) */}
        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Genres<span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="flex items-center px-3 py-1 text-xs font-medium dark:text-white text-gamer-green-dark bg-transparent border border-gamer-green rounded-full shadow-sm"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="ml-1 text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex">
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGenre();
                  }
                }}
                placeholder="Add a genre and press Enter"
                className="flex-grow dark:bg-black border border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
              />
              <Button
                type="button"
                onClick={addGenre}
                className="ml-2 px-4 py-2 bg-gamer-green text-white rounded-md hover:bg-gamer-green-dark transition"
              >
                Add
              </Button>
            </div>
          </div>
        )}

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
