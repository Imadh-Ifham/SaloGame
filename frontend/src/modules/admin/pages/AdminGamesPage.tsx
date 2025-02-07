import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Button } from "@headlessui/react";
import axiosInstance from "../../../axios.config";

import Modal from "../../../components/Modal";
import AdminGameCard from "../components/AdminGames-page/AdminGameCard";
import GameForm from "../components/AdminGames-page/GameForm";

interface Game {
  _id: string;
  image: string;
  name: string;
  rating: number;
  description: string;
  genres: string[];
}

const AdminGamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get("/games");
        if (response.data.success) {
          setGames(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch games.");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

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

  const visibleGames = (() => {
    if (showMore) return games;
    if (screenSize === "desktop") return games;
    if (screenSize === "tablet") return games.slice(0, 6);
    return games.slice(0, 3);
  })();

  const showMoreButton = screenSize === "mobile" || screenSize === "tablet";

  const handleCreateGame = (newGame: Game) => {
    setGames((prevGames) => [newGame, ...prevGames]);
  };

  const handleUpdateGame = (updatedGame: Game) => {
    setGames((prevGames) =>
      prevGames.map((game) =>
        game._id === updatedGame._id ? updatedGame : game
      )
    );
  };

  const handleDeleteGame = (deletedGameId: string) => {
    setGames((prevGames) =>
      prevGames.filter((game) => game._id !== deletedGameId)
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
              <span className="text-gray-900 dark:text-white">Games</span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-gamer-green text-white rounded-lg hover:bg-gamer-green transition-all duration-300"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Game
          </Button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Loading games...
            </p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {visibleGames.map((game, index) => (
              <AdminGameCard
                key={game._id}
                game={game}
                index={index}
                onUpdate={handleUpdateGame}
                onDelete={handleDeleteGame}
              />
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          showMoreButton &&
          games.length > (screenSize === "mobile" ? 3 : 6) && (
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
              </Button>
            </motion.div>
          )}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Game"
        >
          <GameForm
            onSuccess={(newGame: Game) => {
              handleCreateGame(newGame);
              setIsCreateModalOpen(false);
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>
      </div>
    </section>
  );
};

export default AdminGamesPage;
