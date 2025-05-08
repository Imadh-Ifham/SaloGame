import React, { Fragment, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import axiosInstance from "../../../../axios.config";
import GamePreviewForm from "./GamePreviewForm";

interface Game {
  _id: string;
  image: string;
  background_image?: string;
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
  const [nameError, setNameError] = useState<string | null>(null);
  const [description, setDescription] = useState(initialData.description || "");
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [rating, setRating] = useState(initialData.rating || 0);
  const [image, setImage] = useState(initialData.image || "");
  const [genres, setGenres] = useState<string[]>(initialData.genres || []);
  const [genreInput, setGenreInput] = useState<string>(""); // For adding new genres
  const [genreError, setGenreError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Game | null>(null);

  const isEditMode = !!initialData._id;

  // Field validation constants
  const MAX_NAME_LENGTH = 30; // Maximum length for a game name
  const MAX_GENRE_LENGTH = 10; // Maximum length for a genre

  // Validate game name whenever it changes
  useEffect(() => {
    validateGameName(name);
  }, [name]);

  // Validate description whenever it changes
  useEffect(() => {
    validateDescription(description);
  }, [description]);

  const validateGameName = (gameName: string): boolean => {
    setNameError(null);
    
    if (!gameName.trim()) {
      setNameError("Game name is required");
      return false;
    }
    
    if (gameName.length > MAX_NAME_LENGTH) {
      setNameError(`Game name must be ${MAX_NAME_LENGTH} characters or less`);
      return false;
    }
    
    return true;
  };

  const validateDescription = (desc: string): boolean => {
    setDescriptionError(null);
    
    if (!desc.trim() && isEditMode) {
      setDescriptionError("Description is required");
      return false;
    }
    
    return true;
  };

  const validateGenreInput = (genre: string): boolean => {
    setGenreError(null);
    
    if (!genre.trim()) {
      setGenreError("Genre cannot be empty");
      return false;
    }
    
    if (genre.length > MAX_GENRE_LENGTH) {
      setGenreError(`Genre must be ${MAX_GENRE_LENGTH} characters or less`);
      return false;
    }
    
    if (genres.includes(genre)) {
      setGenreError("This genre has already been added");
      return false;
    }
    
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters, numbers, and spaces
    const filteredValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
    setName(filteredValue);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Get the pressed key
    const key = e.key;
    
    // Only allow letters, numbers, spaces, and control keys (backspace, delete, arrows, etc.)
    if (
      !/^[a-zA-Z0-9\s]$/.test(key) && 
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'].includes(key) &&
      !e.ctrlKey && !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Filter out special characters
    const filteredValue = e.target.value.replace(/[^\w\s.,!?()-]/g, '');
    setDescription(filteredValue);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Get the pressed key
    const key = e.key;
    
    // Only allow letters, numbers, spaces, and allowed punctuation
    if (
      !/^[a-zA-Z0-9\s.,!?()-]$/.test(key) && 
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab', 'Enter'].includes(key) &&
      !e.ctrlKey && !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Ensure only up to 2 decimal places
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setRating(Number(value));
    }
  };

  const handleGenreInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters
    const filteredValue = e.target.value.replace(/[^a-zA-Z]/g, '');
    
    // Enforce max length
    if (filteredValue.length <= MAX_GENRE_LENGTH) {
      setGenreInput(filteredValue);
    }
  };

  const handleGenreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Get the pressed key
    const key = e.key;
    
    // Only allow letters and control keys
    if (
      !/^[a-zA-Z]$/.test(key) && 
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'].includes(key) &&
      !e.ctrlKey && !e.metaKey
    ) {
      // Allow Enter to add genre but prevent default
      if (key === 'Enter') {
        e.preventDefault();
        addGenre();
      } else {
        e.preventDefault();
      }
    }
  };

  // Handle adding a new genre
  const addGenre = () => {
    const trimmedGenre = genreInput.trim();
    if (validateGenreInput(trimmedGenre)) {
      setGenres([...genres, trimmedGenre]);
      setGenreInput("");
    }
  };

  // Handle removing a genre
  const removeGenre = (genreToRemove: string) => {
    setGenres(genres.filter((genre) => genre !== genreToRemove));
  };

  // Handle form submission for create mode
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate game name first
    if (!validateGameName(name)) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // First, fetch game details from the backend (which will use RAWG API)
      const response = await axiosInstance.post("/games/preview", { name });
      
      if (response.data.success) {
        // Show preview with fetched data
        setPreviewData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch game details.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle confirmation of game creation
  const handleConfirmCreate = async () => {
    if (!previewData) return;
    
    setLoading(true);
    setError(null);

    try {
      // Format the data to match backend expectations
      const gameData = {
        name: previewData.name,
        description: previewData.description,
        rating: previewData.rating,
        image: previewData.background_image || previewData.image, // Handle both field names
        genres: previewData.genres
      };

      const response = await axiosInstance.post("/games", gameData);
      
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

  // Handle form submission for edit mode
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateGameName(name) || !validateDescription(description)) {
      return;
    }
    
    if (genres.length === 0) {
      setError("Please add at least one genre.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.put(`/games/${initialData._id}`, {
        name,
        description,
        rating: parseFloat(rating.toFixed(2)),
        image,
        genres,
      });

      if (response.data.success) {
        onSuccess(response.data.data);
      } else {
        setError(response.data.message || "Failed to update the game.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle deletion
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

  // If we have preview data and we're in create mode, show the preview form
  if (previewData && !isEditMode) {
    return (
      <GamePreviewForm
        gameData={previewData}
        onConfirm={handleConfirmCreate}
        onCancel={() => {
          setPreviewData(null);
          setError(null);
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="bg-transparent p-0 font-poppins rounded-lg shadow-none">
      <form onSubmit={isEditMode ? handleEditSubmit : handleCreateSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            onKeyDown={handleNameKeyDown}
            className={`mt-1 block dark:bg-black w-full border ${
              nameError ? 'border-red-500' : 'border-gamer-green'
            } rounded-md shadow-sm p-2 focus:ring-0 focus:border-gamer-green`}
            placeholder="Enter game name (max 30 characters)"
            maxLength={MAX_NAME_LENGTH}
            required
            autoFocus
          />
          {nameError && (
            <p className="mt-1 text-sm text-red-500">{nameError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {name.length}/{MAX_NAME_LENGTH} characters
          </p>
        </div>

        {/* Description (Only in Edit Mode) */}
        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Description<span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              onKeyDown={handleDescriptionKeyDown}
              className={`mt-1 block w-full border dark:bg-black ${
                descriptionError ? 'border-red-500' : 'border-gamer-green'
              } rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green`}
              rows={4}
              placeholder="Enter game description"
              required
            ></textarea>
            {descriptionError && (
              <p className="mt-1 text-sm text-red-500">{descriptionError}</p>
            )}
          </div>
        )}

        {/* Rating (Only in Edit Mode) */}
        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Rating<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={rating}
              onChange={handleRatingChange}
              className="mt-1 block w-full border dark:bg-black border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
              min={0}
              max={5}
              placeholder="Enter rating (0-5, up to 2 decimal places)"
              required={isEditMode}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Rating must be between 0 and 5, with up to 2 decimal places (e.g., 4.25)
            </p>
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
              placeholder="Enter image URL (https://...)"
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
                onChange={handleGenreInputChange}
                onKeyDown={handleGenreKeyDown}
                placeholder={`Add a genre (max ${MAX_GENRE_LENGTH} letters)`}
                className={`flex-grow dark:bg-black border ${
                  genreError ? 'border-red-500' : 'border-gamer-green'
                } rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green`}
                maxLength={MAX_GENRE_LENGTH}
              />
              <Button
                type="button"
                onClick={addGenre}
                className="ml-2 px-4 py-2 bg-gamer-green text-white rounded-md hover:bg-gamer-green-dark transition"
              >
                Add
              </Button>
            </div>
            {genreError && (
              <p className="mt-1 text-sm text-red-500">{genreError}</p>
            )}
            {genreInput && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {genreInput.length}/{MAX_GENRE_LENGTH} characters
              </p>
            )}
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
            {loading ? (
              isEditMode ? "Updating..." : "Fetching..."
            ) : (
              isEditMode ? "Update Game" : "Preview Game"
            )}
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
