// src/components/AdminGameCard.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Button } from "@headlessui/react";

import GameForm from "./GameForm";
import Modal from "../../../../components/Modal";
import axiosInstance from "../../../../axios.config";

interface Game {
  _id: string;
  image: string;
  name: string;
  rating: number;
  description: string;
}

interface AdminGameCardProps {
  game: Game;
  index: number;
  onUpdate: (updatedGame: Game) => void;
  onDelete: (deletedGameId: string) => void;
}

const AdminGameCard: React.FC<AdminGameCardProps> = ({
  game,
  index,
  onUpdate,
  onDelete,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await axiosInstance.delete(`/games/${game._id}`);
      if (response.data.success) {
        onDelete(game._id);
        setIsDeleteConfirmOpen(false);
      } else {
        setDeleteError(response.data.message || "Failed to delete the game.");
      }
    } catch (error: any) {
      setDeleteError(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="flex group relative p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-background dark:bg-background-dark border border-border-primary"
      >
        {/* Game Image */}
        <div className="w-1/3 h-40 rounded-lg overflow-hidden">
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Card Content */}
        <div className="ml-6 flex flex-col justify-between w-2/3">
          <div>
            <h3 className="text-xl font-poppins font-semibold mb-2 text-text-primary">
              {game.name}
            </h3>
            <p className="text-sm font-poppins text-text-secondary dark:text-neutral-500 mb-4">
              {game.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-base font-poppins text-green-500">
              {game.rating}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 bg-gamer-green text-white rounded hover:bg-gamer-green-dark transition"
                title="Edit Game"
              >
                <PencilIcon className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                disabled={isDeleting}
                title="Delete Game"
              >
                <TrashIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Glowing Outline */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-gamer-green rounded-2xl transition-all duration-300 pointer-events-none" />
      </motion.div>

      {/* Edit Game Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Game"
      >
        <GameForm
          initialData={game}
          onSuccess={(updatedGame: Game) => {
            onUpdate(updatedGame);
            setIsEditModalOpen(false);
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{game.name}</span>? This action
            cannot be undone.
          </p>
          {deleteError && (
            <div className="text-red-500 text-sm text-center">
              {deleteError}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Error Message */}
      {deleteError && !isDeleteConfirmOpen && (
        <div className="mt-2 text-red-500 text-sm text-center">
          {deleteError}
        </div>
      )}
    </>
  );
};

export default AdminGameCard;
