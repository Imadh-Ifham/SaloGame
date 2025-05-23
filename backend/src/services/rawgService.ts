import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const RAWG_API_KEY = process.env.RAWG_API_KEY;
if (!RAWG_API_KEY) {
  throw new Error("RAWG_API_KEY is not defined in the .env file.");
}

interface RawgGame {
  name: string;
  description: string;
  rating: number;
  background_image: string;
  genres: string[]; // List of genres
}

interface RawgGenre {
  name: string;
}

// Fetches detailed game information from the RAWG API.
 
export const searchRawgGame = async (
  query: string
): Promise<RawgGame | null> => {
  const BASE_URL = "https://api.rawg.io/api/games";

  try {
    // Make the API request to RAWG
    const response = await axios.get(BASE_URL, {
      params: {
        key: RAWG_API_KEY, // API key
        search: query, // Game name
        page_size: 1, // Limit to the first result
      },
    });

    const results = response.data.results;
    if (!results || results.length === 0) {
      console.warn(`No results found for query: "${query}"`);
      return null;
    }

    const game = results[0];

    // Fetch additional details for the game using its ID
    const detailsResponse = await axios.get(
      `https://api.rawg.io/api/games/${game.id}`,
      {
        params: {
          key: RAWG_API_KEY, // API key
        },
      }
    );

    const gameDetails = detailsResponse.data;

    // Extract and return relevant game information
    return {
      name: gameDetails.name,
      description: gameDetails.description_raw || "No description available.",
      rating: gameDetails.rating || 0,
      background_image: gameDetails.background_image || "",
      genres: gameDetails.genres?.map((genre: RawgGenre) => genre.name) || [],
    };
  } catch (error) {
    // Log the error for debugging
    if (axios.isAxiosError(error)) {
      console.error(
        `Error fetching game from RAWG API for query "${query}":`,
        error.response?.data || error.message
      );
    } else {
      console.error(
        `Unexpected error while fetching game for query "${query}":`,
        error
      );
    }

    return null;
  }
};
