import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axios.config";

interface OfferState {
  offers: any[];
  totalActiveOffers: number;
  mostUsedOffer: string;
  loading: boolean;
  error: string | null;
}

const initialState: OfferState = {
  offers: [],
  totalActiveOffers: 0,
  mostUsedOffer: "",
  loading: false,
  error: null,
};

interface Offer {
  _id: string;
  title: string;
  isActive: boolean;
  usageCount: number;
  category: string;
  endDateTime?: Date;
}

export const fetchOfferData = createAsyncThunk(
  "offer/fetchOfferData",
  async () => {
    try {
      const response = await axiosInstance.get("/offer");
      const offers: Offer[] = response.data.data || [];

      // Filter active offers more accurately
      const activeOffers = offers.filter((offer) => {
        if (!offer || !offer.isActive) return false;

        // For time-based offers, check if they're within their valid period
        if (offer.category === "time-based" && offer.endDateTime) {
          const currentDate = new Date();
          const endDate = new Date(offer.endDateTime);
          return endDate > currentDate;
        }

        return true; // Non-time-based offers just need to be active
      });

      // Calculate most used offer
      const mostUsed =
        offers.length > 0
          ? offers.reduce((prev, current) => {
              return (prev.usageCount || 0) > (current.usageCount || 0)
                ? prev
                : current;
            })
          : { title: "No offers" };

      const payload = {
        offers,
        totalActive: activeOffers.length,
        mostUsed: mostUsed?.title || "No offers",
      };

      return payload;
    } catch (error) {
      console.error("Error fetching offer data:", error);
      throw error;
    }
  }
);

const offerSlice = createSlice({
  name: "offer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfferData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfferData.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload.offers;
        state.totalActiveOffers = action.payload.totalActive;
        state.mostUsedOffer = action.payload.mostUsed;
      })
      .addCase(fetchOfferData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch offer data";
        state.totalActiveOffers = 0;
        state.mostUsedOffer = "No offers";
      });
  },
});

export default offerSlice.reducer;
