import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PencilIcon,
  TrashIcon,
  ComputerDesktopIcon,
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
        className="flex bg-background dark:bg-background-dark border border-border-primary rounded-lg overflow-hidden shadow-md"
      >
        <div className="w-2/5">
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 w-3/5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-poppins font-semibold text-text-primary dark:text-white mb-2">
              {game.name}
            </h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {game.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 text-xs font-poppins text-gamer-green border border-gamer-green rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-1">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1 hover:text-gamer-green transition"
              title="Edit Game"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="p-1 hover:text-red-500 transition"
              disabled={isDeleting}
              title="Delete Game"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsAssignModalOpen(true)}
              className="p-1 hover:text-blue-500 transition"
              title="Assign Machines"
            >
              <ComputerDesktopIcon className="w-4 h-4" />
            </Button>
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
