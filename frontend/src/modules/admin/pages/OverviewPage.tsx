import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiUsers, FiCalendar } from 'react-icons/fi';
import MachineStats from '../components/Overview-page/MachineStats';
import StatsCard from '../components/Overview-page/StatsCard';
import TransactionList from '../components/Overview-page/TransactionList';
import { RevenueChart } from '../components/Overview-page/RevenueChart';
import { getTransactions, ITransaction, TransactionPaginationParams } from '../../../api/transactionService';

// Sample data - replace with real data later
const sampleRevenueData = [
  { date: 'Jan', revenue: 4000 },
  { date: 'Feb', revenue: 3000 },
  { date: 'Mar', revenue: 5000 },
  { date: 'Apr', revenue: 4500 },
  { date: 'May', revenue: 6000 },
  { date: 'Jun', revenue: 5500 },
];

const OverviewPage: React.FC = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const limit = 15;

  const fetchTransactions = async (pageNum: number, dateFilters?: { startDate?: Date | null, endDate?: Date | null }) => {
    try {
      setIsLoading(true);
      
      // Only include date parameters if they are valid Date objects
      const params: TransactionPaginationParams = { 
        page: pageNum, 
        limit
      };
      
      if (dateFilters?.startDate) {
        params.startDate = dateFilters.startDate;
      }
      
      if (dateFilters?.endDate) {
        params.endDate = dateFilters.endDate;
      }
      
      console.log('Requesting transactions with filters:', params);
      
      const response = await getTransactions(params);
      
      if (pageNum === 1) {
        setTransactions(response.transactions);
      } else {
        setTransactions((prev) => [...prev, ...response.transactions]);
      }
      
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transactions when component mounts or date filters change
  useEffect(() => {
    setPage(1); // Reset to first page when date filters change
    fetchTransactions(1, { startDate: startDate || undefined, endDate: endDate || undefined });
  }, [startDate, endDate]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage, { startDate: startDate || undefined, endDate: endDate || undefined });
  };

  const handleDateFilterChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div id="overview-page-content" className="flex-1 h-screen overflow-y-auto scrollbar-hide bg-white dark:bg-background-dark">
      <div className="p-6 space-y-8 pb-12">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        </div>
        
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Revenue"
            value="$24,500"
            icon={<FiDollarSign className="text-primary" />}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Active Members"
            value="1,234"
            icon={<FiUsers className="text-blue-600 dark:text-blue-400" />}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="Upcoming Events"
            value="6"
            icon={<FiCalendar className="text-emerald-600 dark:text-emerald-400" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RevenueChart data={sampleRevenueData} />
          <MachineStats />
        </div>

        {/* Transactions Section */}
        <div>
          <TransactionList
            transactions={transactions}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={isLoading}
            startDate={startDate}
            endDate={endDate}
            onDateFilterChange={handleDateFilterChange}
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewPage; 