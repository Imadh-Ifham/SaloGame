import axiosInstance from "../axios.config";

export interface ITransaction {
  _id: string;
  userID: {
    _id: string;
    name: string;
    email: string;
  };
  paymentType?: "cash" | "card" | "XP";
  amount: number;
  transactionType: "online-booking" | "walk-in-booking" | "membership" | "refund";
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface TransactionPaginationParams {
  page: number;
  limit: number;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface TransactionResponse {
  transactions: ITransaction[];
  totalCount: number;
  hasMore: boolean;
}

export interface TransactionReportParams {
  period: '3mo' | '6mo' | '1yr';
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface TransactionReportData {
  transactions: ITransaction[];
  metrics: {
    totalTransactions: number;
    completedTransactions: number;
    totalRevenue: number;
    averageTransactionValue: number;
    transactionsByType: Record<string, number>;
    transactionsByPayment: Record<string, number>;
  };
  startDate: Date;
  endDate: Date;
}

// Function to fetch transactions with pagination
export const getTransactions = async ({ 
  page = 1, 
  limit = 15,
  startDate,
  endDate 
}: TransactionPaginationParams): Promise<TransactionResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Add date filters if provided
    if (startDate) {
      // Format date as ISO string and ensure it's set to start of day
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      params.append('startDate', startOfDay.toISOString());
    }
    
    if (endDate) {
      // Set end date to end of day for inclusive filtering
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      params.append('endDate', endOfDay.toISOString());
    }
    
    // Log the query parameters for debugging
    console.log('Transaction query params:', Object.fromEntries(params.entries()));
    
    const response = await axiosInstance.get(`/transactions?${params.toString()}`);
    
    return {
      transactions: response.data.transactions || response.data,
      totalCount: response.data.totalCount || response.data.length,
      hasMore: response.data.hasMore || false
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

// Function to fetch user transactions with pagination
export const getUserTransactions = async ({ 
  page = 1, 
  limit = 15,
  startDate,
  endDate
}: TransactionPaginationParams): Promise<TransactionResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Add date filters if provided
    if (startDate) {
      // Format date as ISO string and ensure it's set to start of day
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      params.append('startDate', startOfDay.toISOString());
    }
    
    if (endDate) {
      // Set end date to end of day for inclusive filtering
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      params.append('endDate', endOfDay.toISOString());
    }
    
    // Log the query parameters for debugging
    console.log('User transaction query params:', Object.fromEntries(params.entries()));
    
    const response = await axiosInstance.get(`/transactions/my-transactions?${params.toString()}`);
    
    return {
      transactions: response.data.transactions || response.data,
      totalCount: response.data.totalCount || response.data.length,
      hasMore: response.data.hasMore || false
    };
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    throw error;
  }
};

// Function to fetch transaction report data for a specific period
export const getTransactionReport = async ({ 
  period,
  startDate,
  endDate
}: TransactionReportParams): Promise<TransactionReportData> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('period', period);
    
    // Add custom date range if provided
    if (startDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      params.append('startDate', startOfDay.toISOString());
    }
    
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      params.append('endDate', endOfDay.toISOString());
    }
    
    console.log('Transaction report params:', Object.fromEntries(params.entries()));
    
    const response = await axiosInstance.get(`/transactions/report?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction report data:", error);
    throw error;
  }
}; 