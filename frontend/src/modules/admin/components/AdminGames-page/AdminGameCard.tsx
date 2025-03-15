import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PencilIcon,
  TrashIcon,
  ComputerDesktopIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@headlessui/react";

import GameForm from "./GameForm";
import Modal from "../../../../components/Modal";
import axiosInstance from "../../../../axios.config";
import AssignMachinesForm from "./AssignMachinesForm";

interface Game {
  _id: string;
  image: string;
  name: string;
  rating: number;
  description: string;
  genres: string[];
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
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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
        transition={{ duration: 0.3, delay: index * 0.1 }}
        viewport={{ once: true }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-background/30 dark:bg-background-dark/30 backdrop-blur-md border border-border-primary/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* Game Image with Overlay */}
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={game.image}
            alt={game.name}
            className={`w-full h-full object-cover transition-all duration-300 ${isHovered ? 'scale-105 brightness-[0.85] blur-[2px]' : ''}`}
          />
          
          {/* Admin Actions Overlay */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-3 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 bg-gamer-green text-white rounded-full shadow-xl transition-all transform hover:scale-110 hover:bg-gamer-green/90"
              title="Edit Game"
            >
              <PencilIcon className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="p-3 bg-red-500 text-white rounded-full shadow-xl transition-all transform hover:scale-110 hover:bg-red-500/90"
              disabled={isDeleting}
              title="Delete Game"
            >
              <TrashIcon className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsAssignModalOpen(true)}
              className="p-3 bg-blue-500 text-white rounded-full shadow-xl transition-all transform hover:scale-110 hover:bg-blue-500/90"
              title="Assign Machines"
            >
              <ComputerDesktopIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Game Info */}
        <div className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-press font-semibold text-text-primary dark:text-white truncate flex-1">
              {game.name}
            </h3>
            <div className="flex items-center gap-1 bg-gamer-green/10 px-2 py-0.5 rounded-full ml-2">
              <StarIcon className="w-3.5 h-3.5 text-gamer-green" />
              <span className="text-xs font-medium text-gamer-green">
                {game.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {game.genres.map((genre) => (
              <span
                key={genre}
                className="px-1.5 py-0.5 text-xs font-medium text-gamer-green bg-gamer-green/10 rounded-full border border-gamer-green/20"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

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

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Machines"
      >
        <AssignMachinesForm
          game={game}
          onSuccess={() => setIsAssignModalOpen(false)}
          onCancel={() => setIsAssignModalOpen(false)}
        />
      </Modal>

      {deleteError && !isDeleteConfirmOpen && (
        <div className="mt-2 text-red-500 text-sm text-center">
          {deleteError}
        </div>
      )}
    </>
  );
};

export default AdminGameCard;
