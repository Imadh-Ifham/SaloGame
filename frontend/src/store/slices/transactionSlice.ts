import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getTransactions, ITransaction, TransactionPaginationParams, TransactionResponse } from '../../api/transactionService';
import socket from '../../utils/socket.util';

interface TransactionState {
  transactions: ITransaction[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  startDate: Date | null;
  endDate: Date | null;
}

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
  hasMore: false,
  totalCount: 0,
  currentPage: 1,
  startDate: null,
  endDate: null,
};

// Async thunk to fetch transactions
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params: TransactionPaginationParams, { rejectWithValue }) => {
    try {
      return await getTransactions(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch transactions');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setDateFilter: (state, action: PayloadAction<{ startDate: Date | null; endDate: Date | null }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.currentPage = 1; // Reset to first page when filters change
    },
    addNewTransaction: (state, action: PayloadAction<ITransaction>) => {
      // Add the new transaction to the beginning of the list
      state.transactions.unshift(action.payload);
      state.totalCount += 1;
    },
    resetTransactions: (state) => {
      state.transactions = [];
      state.currentPage = 1;
      state.hasMore = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<TransactionResponse>) => {
        state.isLoading = false;
        // If this is page 1, replace the transactions, otherwise append
        if (state.currentPage === 1) {
          state.transactions = action.payload.transactions;
        } else {
          state.transactions = [...state.transactions, ...action.payload.transactions];
        }
        state.hasMore = action.payload.hasMore;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Setup WebSocket listeners for real-time transaction updates
export const setupTransactionWebSocketListeners = (dispatch: any) => {
  // Listen for new transactions
  socket.on('transaction:created', (data: ITransaction) => {
    dispatch(addNewTransaction(data));
  });

  return () => {
    socket.off('transaction:created');
  };
};

export const { setDateFilter, addNewTransaction, resetTransactions } = transactionSlice.actions;

export default transactionSlice.reducer; 