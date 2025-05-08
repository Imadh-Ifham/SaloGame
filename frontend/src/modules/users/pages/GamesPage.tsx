import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Button } from "@headlessui/react";
import HomeLayout from "../layout/HomeLayout";
import axiosInstance from "../../../axios.config";
import GameCardSkeleton from "../../../components/GameCardSkeleton";
import GameCard from "../components/GameCard";

interface Game {
  _id: string;
  image: string;
  name: string;
  rating: number;
  description: string;
  genres: string[];
}

const GAMES_PER_PAGE = 8;

const GamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cachedGames, setCachedGames] = useState<Record<string, Game[]>>({});
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shouldShowHeader, setShouldShowHeader] = useState(true);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollThreshold = 10; // Minimum scroll amount to trigger header visibility change

      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        setShouldShowHeader(!scrollingDown || currentScrollY < 50);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Fetch all unique genres when component mounts
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axiosInstance.get("/games");
        if (response.data.success) {
          const genres = new Set<string>();
          response.data.data.forEach((game: Game) => {
            game.genres.forEach(genre => genres.add(genre));
          });
          setAllGenres(Array.from(genres));
        }
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // Create a cache key based on current filters
  const getCacheKey = useCallback((pageNum: number, filters: { genre?: string; search?: string }) => {
    return `${pageNum}-${filters.genre || 'all'}-${filters.search || ''}`;
  }, []);

  // Fetch games with pagination
  const fetchGames = useCallback(async (pageNum: number) => {
    const cacheKey = getCacheKey(pageNum, {
      genre: selectedGenre,
      search: searchQuery
    });
    
    // Check if we have cached data
    if (cachedGames[cacheKey]) {
      return cachedGames[cacheKey];
    }

    try {
      const response = await axiosInstance.get("/games", {
        params: {
          page: pageNum,
          limit: GAMES_PER_PAGE,
          genre: selectedGenre !== "all" ? selectedGenre : undefined,
          search: searchQuery || undefined
        }
      });
      
      if (response.data.success) {
        const newGames = response.data.data;
        setCachedGames(prev => ({
          ...prev,
          [cacheKey]: newGames
        }));
        setHasMore(newGames.length === GAMES_PER_PAGE);
        return newGames;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch games:", err);
      return [];
    }
  }, [cachedGames, getCacheKey, selectedGenre, searchQuery]);

  // Handle page loading
  useEffect(() => {
    const loadGames = async () => {
      if (page === 1) {
        setLoading(true);
        setGames([]); // Reset games when starting fresh
      }
      setError(null);

      try {
        const newGames = await fetchGames(page);
        
        if (page === 1) {
          setGames(newGames);
        } else {
          setGames(prev => {
            // Create a Set of existing IDs for O(1) lookup
            const existingIds = new Set(prev.map(game => game._id));
            // Filter out duplicates from newGames
            const uniqueNewGames = newGames.filter((game: Game) => !existingIds.has(game._id));
            return [...prev, ...uniqueNewGames];
          });
        }
      } catch (err) {
        setError((err as Error).message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [page, fetchGames]);

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

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setPage(1);
    setGames([]); // Reset games when changing genre
    setFilteredGames([]); // Reset filtered games
    setHasMore(true);
    setSearchQuery(""); // Reset search when changing genre
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      // When clearing search, reset to current games list
      setFilteredGames(games);
    }
  };

  return (
    <HomeLayout>
      <div className="min-h-screen">
        {/* Smart Scroll Header Section */}
        <motion.div
          initial={{ y: 0, opacity: 1 }}
          animate={{ 
            y: shouldShowHeader ? 0 : -100,
            opacity: shouldShowHeader ? 1 : 0,
            filter: shouldShowHeader ? "blur(0px)" : "blur(4px)"
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
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                {/* Title Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center sm:text-left"
                >
                  <h2 className="text-4xl sm:text-2xl font-press font-normal">
                    <span className="text-gamer-green">Explore Our</span>{" "}
                    <span className="text-white">Games</span>
                  </h2>
                  <div className="w-16 sm:w-24 h-1 bg-gamer-green rounded-full mt-4" />
                </motion.div>

                {/* Search and Filter Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
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

                  {/* Genre Filter */}
                  <div className="relative w-full sm:w-48">
                    <select
                      value={selectedGenre}
                      onChange={(e) => handleGenreChange(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gamer-green/20 bg-[#111111]/60 text-white focus:outline-none focus:border-gamer-green/50 appearance-none cursor-pointer transition-colors"
                    >
                      <option value="all" className="bg-[#111111]">All Genres</option>
                      {allGenres.map((genre) => (
                        <option key={genre} value={genre} className="bg-[#111111]">
                          {genre}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gamer-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Games Grid Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Handling Loading and Error States */}
          {loading && page === 1 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {Array.from({ length: GAMES_PER_PAGE }).map((_, index) => (
                <GameCardSkeleton key={index} index={index} />
              ))}
            </motion.div>
          ) : error ? (
            <div className="flex justify-center items-center">
              <p className="text-lg text-red-500">{error}</p>
            </div>
          ) : (
            <>
              {/* Game Cards Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <GameCard
                      image={game.image}
                      name={game.name}
                      rating={game.rating}
                      description={game.description}
                      genres={game.genres}
                      index={index}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              {!loading && hasMore && !searchQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center mt-8"
                >
                  <Button
                    onClick={handleLoadMore}
                    className="flex items-center px-4 py-2 bg-gamer-green text-white rounded-lg hover:bg-gamer-green/80 transition-all duration-300"
                  >
                    Load More
                    <ChevronDownIcon className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </HomeLayout>
  );
};

export default GamesPage;
