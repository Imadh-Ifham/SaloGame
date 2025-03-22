import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axios.config";

interface MembershipType {
  _id: string;
  name: string;
  price: number;
  benefits: string[];
  subscriberCount: number;
  isActive: boolean;
  xpRate: number;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  defaultMembershipId?: {
    _id: string;
    name: string;
  };
  role: string;
  subscription?: {
    _id: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

interface MembershipState {
  memberships: MembershipType[];
  totalActiveMembers: number;
  mostPopularMembership: string;
  members: Member[];
  loading: boolean;
  error: string | null;
}

const initialState: MembershipState = {
  memberships: [],
  totalActiveMembers: 0,
  mostPopularMembership: "",
  members: [],
  loading: false,
  error: null,
};

// Async thunk for fetching membership data
export const fetchMembershipData = createAsyncThunk(
  "membership/fetchMembershipData",
  async () => {
    const response = await axiosInstance.get("/memberships");
    const memberships: MembershipType[] = response.data;

    const totalActive = memberships.reduce(
      (sum, membership) => sum + membership.subscriberCount,
      0
    );

    const mostPopular = memberships.reduce(
      (prev, current) =>
        prev.subscriberCount > current.subscriberCount ? prev : current,
      memberships[0]
    );

    return {
      memberships,
      totalActive,
      mostPopular: mostPopular?.name || "No memberships",
    };
  }
);

// Async Thunk for fetching Members
export const fetchMembers = createAsyncThunk(
  "membership/fetchMembers",
  async () => {
    try {
      const response = await axiosInstance.get("/users");
      const userMembers = response.data.filter(
        (user: Member) => user.role === "user"
      );
      return userMembers;
    } catch (error) {
      throw error;
    }
  }
);

export const createMembership = createAsyncThunk(
  "membership/createMembership",
  async (formData: Partial<MembershipType>) => {
    const response = await axiosInstance.post("/memberships", formData);
    return response.data;
  }
);

export const updateMembership = createAsyncThunk(
  "membership/updateMembership",
  async ({ id, data }: { id: string; data: Partial<MembershipType> }) => {
    const response = await axiosInstance.put(`/memberships/${id}`, data);
    return response.data;
  }
);

export const deleteMembership = createAsyncThunk(
  "membership/deleteMembership",
  async (id: string) => {
    await axiosInstance.delete(`/memberships/${id}`);
    return id;
  }
);

export const renewSubscription = createAsyncThunk(
  "membership/renewSubscription",
  async (subscriptionId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/subscriptions/${subscriptionId}/renew`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to renew subscription"
      );
    }
  }
);

export const toggleMembershipActive = createAsyncThunk(
  "membership/toggleMembershipActive",
  async ({ id, isActive }: { id: string; isActive: boolean }) => {
    const response = await axiosInstance.patch(
      `/memberships/${id}/toggle-active`,
      { isActive }
    );
    return response.data;
  }
);

// Create Redux slice
const membershipSlice = createSlice({
  name: "membership",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Cases for membership
      .addCase(fetchMembershipData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipData.fulfilled, (state, action) => {
        state.loading = false;
        state.memberships = action.payload.memberships;
        state.totalActiveMembers = action.payload.totalActive;
        state.mostPopularMembership = action.payload.mostPopular;
      })
      .addCase(fetchMembershipData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch membership data";
      });

    // Create Membership
    builder.addCase(createMembership.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createMembership.fulfilled, (state, action) => {
      state.loading = false;
      state.memberships.push(action.payload);
    });
    builder.addCase(createMembership.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to create membership";
    });

    // Update Membership
    builder.addCase(updateMembership.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateMembership.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.memberships.findIndex(
        (m) => m._id === action.payload._id
      );
      if (index !== -1) {
        state.memberships[index] = action.payload;
      }
    });
    builder.addCase(updateMembership.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to update membership";
    });

    // Delete Membership
    builder.addCase(deleteMembership.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteMembership.fulfilled, (state, action) => {
      state.loading = false;
      state.memberships = state.memberships.filter(
        (m) => m._id !== action.payload
      );
    });
    builder.addCase(deleteMembership.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to delete membership";
    });

    // Toggle Active Status
    builder.addCase(toggleMembershipActive.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(toggleMembershipActive.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.memberships.findIndex(
        (m) => m._id === action.payload._id
      );
      if (index !== -1) {
        state.memberships[index] = action.payload;
      }
    });
    builder
      .addCase(toggleMembershipActive.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to update membership status";
      })

      // Cases for members
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch members";
      })

      // Renew Subscription
      .addCase(renewSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(renewSubscription.fulfilled, (state, action) => {
        state.loading = false;
        // Update the subscription in the state if needed
        const updatedSubscription = action.payload;
        const memberIndex = state.members.findIndex(
          (member) => member.subscription?._id === updatedSubscription._id
        );
        if (memberIndex !== -1) {
          state.members[memberIndex].subscription = updatedSubscription;
        }
      })
      .addCase(renewSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default membershipSlice.reducer;
