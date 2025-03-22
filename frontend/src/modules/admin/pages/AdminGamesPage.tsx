import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Button } from "@headlessui/react";
import axiosInstance from "../../../axios.config";

import Modal from "../../../components/Modal";
import AdminGameCard from "../components/AdminGames-page/AdminGameCard";
import GameForm from "../components/AdminGames-page/GameForm";
import GameCardSkeleton from "../../../components/GameCardSkeleton";

interface Game {
  _id: string;
  image: string;
  name: string;
  rating: number;
  description: string;
  genres: string[];
}

const GAMES_PER_PAGE = 12; // Admin page shows 12 games per page

const AdminGamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shouldShowHeader, setShouldShowHeader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Handle scroll behavior
  useEffect(() => {
    const mainContentDiv = document.getElementById('games-page-content');
    
    const handleScroll = () => {
      const currentScrollY = mainContentDiv ? mainContentDiv.scrollTop : window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollThreshold = 10;

      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        setShouldShowHeader(!scrollingDown || currentScrollY < 50);
        setLastScrollY(currentScrollY);
      }
    };

    // Add event listener to the div if it exists, otherwise use window
    const scrollElement = mainContentDiv || window;
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const fetchGames = async (page: number) => {
    const isInitialFetch = page === 1;
    
    if (isInitialFetch) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);
    
    try {
      const response = await axiosInstance.get("/games", {
        params: {
          page,
          limit: GAMES_PER_PAGE
        }
      });
      
      if (response.data.success) {
        const newGames = response.data.data;
        if (newGames.length < GAMES_PER_PAGE) {
          setHasMore(false);
        }
        
        if (isInitialFetch) {
          setGames(newGames);
          setFilteredGames(newGames);
        } else {
          setGames(prevGames => [...prevGames, ...newGames]);
          setFilteredGames(prevGames => [...prevGames, ...newGames]);
        }
      } else {
        setError(response.data.message || "Failed to fetch games.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      if (isInitialFetch) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchGames(1);
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

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery) {
      setFilteredGames(games);
      return;
    }

    const searchTerm = searchQuery.toLowerCase();
    const filtered = games.filter(game => 
      game.name.toLowerCase().includes(searchTerm)
    );
    
    setFilteredGames(filtered);
  }, [searchQuery, games]);

  const visibleGames = (() => {
    if (showMore) return filteredGames;
    if (screenSize === "desktop") return filteredGames;
    if (screenSize === "tablet") return filteredGames.slice(0, 6);
    return filteredGames.slice(0, 3);
  })();

  const showMoreButton = screenSize === "mobile" || screenSize === "tablet";

  const handleCreateGame = (newGame: Game) => {
    setGames((prevGames) => [newGame, ...prevGames]);
    setFilteredGames((prevGames) => [newGame, ...prevGames]);
  };

  const handleUpdateGame = (updatedGame: Game) => {
    setGames((prevGames) =>
      prevGames.map((game) =>
        game._id === updatedGame._id ? updatedGame : game
      )
    );
    setFilteredGames((prevGames) =>
      prevGames.map((game) =>
        game._id === updatedGame._id ? updatedGame : game
      )
    );
  };

  const handleDeleteGame = (deletedGameId: string) => {
    setGames((prevGames) =>
      prevGames.filter((game) => game._id !== deletedGameId)
    );
    setFilteredGames((prevGames) =>
      prevGames.filter((game) => game._id !== deletedGameId)
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchGames(nextPage);
  };

  // Helper function to render skeleton loaders
  const renderSkeletons = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, index) => (
        <motion.div
          key={`skeleton-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <GameCardSkeleton />
        </motion.div>
      ));
  };

  return (
    <div 
      id="games-page-content"
      className="flex-1 h-screen overflow-y-auto scrollbar-hide bg-white dark:bg-background-dark"
    >
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        {/* Smart Scroll Header Section */}
        <motion.div
          initial={{ y: 0, opacity: 1 }}
          animate={{ 
            y: shouldShowHeader ? 0 : -100,
            opacity: shouldShowHeader ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="sticky top-[72px] z-40 transition-all duration-300"
        >
          <div className="relative">
            {/* Backdrop blur only when scrolled */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 to-transparent backdrop-blur-sm transition-opacity duration-300"
              style={{ opacity: lastScrollY > 50 ? 1 : 0 }}
            />

            {/* Content */}
            <div className="relative max-w-7xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                {/* Title Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center sm:text-left"
                >
                  <h2 className="text-3xl sm:text-2xl font-press font-semibold text-primary">
                    Manage Our{" "}
                    <span className="text-gray-900 dark:text-white">Games</span>
                  </h2>
                  <div className="w-16 sm:w-24 h-1 bg-primary mx-auto sm:mx-0 rounded-full mt-4" />
                </motion.div>

                {/* Search and Add Game Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-4"
                >
                  {/* Search Input */}
                  <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gamer-green" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search games..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gamer-green/20 bg-[#111111]/60 text-white placeholder-gray-400 focus:outline-none focus:border-gamer-green/50 transition-colors"
                    />
                  </div>

                  {/* Add Game Button */}
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-gamer-green text-white rounded-lg hover:bg-gamer-green/90 transition-all duration-300"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Game
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {renderSkeletons(12)}
          </div>
        ) : error ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
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

            {/* Load More Section */}
            {loadingMore && (
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                {renderSkeletons(4)}
              </div>
            )}

            {!searchQuery && hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mt-8"
              >
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center px-6 py-3 bg-gamer-green text-white rounded-lg hover:bg-gamer-green/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center">
                    Load More Games
                  </span>
                </Button>
              </motion.div>
            )}
          </>
        )}

        {!loading &&
          !error &&
          showMoreButton &&
          filteredGames.length > (screenSize === "mobile" ? 3 : 6) && (
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
    </div>
  );
};

export default AdminGamesPage;
