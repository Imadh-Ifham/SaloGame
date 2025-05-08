import React, { useEffect } from "react";
import { FiDollarSign, FiUsers, FiCalendar } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import MachineStats from "../components/Overview-page/MachineStats";
import StatsCard from "../components/Overview-page/StatsCard";
import TransactionList from "../components/Overview-page/TransactionList";
import { RevenueChart } from "../components/Overview-page/RevenueChart";
import { TransactionPaginationParams } from "../../../api/transactionService";
import { RootState } from "../../../store/store";
import {
  fetchLast30DaysEarnings,
  fetchLastSixMonthsRevenue,
} from "../../../store/slices/revenueSlice";
import {
  fetchTransactions,
  setDateFilter,
} from "../../../store/slices/transactionSlice";

const OverviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const {
    last30DaysEarnings,
    monthlyRevenue,
    isLoading: isLoadingRevenue,
    isLoadingMonthly,
  } = useSelector((state: RootState) => state.revenue);
  const { transactions, isLoading, hasMore, currentPage, startDate, endDate } =
    useSelector((state: RootState) => state.transactions);

  const limit = 15;

  // Fetch last 30 days earnings when component mounts
  useEffect(() => {
    dispatch(fetchLast30DaysEarnings() as any);
  }, [dispatch]);

  // Fetch last 6 months revenue data when component mounts
  useEffect(() => {
    dispatch(fetchLastSixMonthsRevenue() as any);
  }, [dispatch]);

  // Fetch transactions when component mounts
  useEffect(() => {
    const params: TransactionPaginationParams = {
      page: 1,
      limit,
      startDate,
      endDate,
    };

    dispatch(fetchTransactions(params) as any);
  }, [dispatch, startDate, endDate]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;

    const params: TransactionPaginationParams = {
      page: nextPage,
      limit,
      startDate,
      endDate,
    };

    dispatch(fetchTransactions(params) as any);
  };

  const handleDateFilterChange = (start: Date | null, end: Date | null) => {
    dispatch(setDateFilter({ startDate: start, endDate: end }));
  };

  // Format currency with commas
  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Last 30 Days Revenue"
            value={
              isLoadingRevenue
                ? "Loading..."
                : formatCurrency(last30DaysEarnings)
            }
            icon={<FiDollarSign className="text-primary" />}
            trend={{ value: 12.5, isPositive: true }} //temp-Placeholder
          />
          <StatsCard
            title="Active Members"
            value="1,234"
            icon={<FiUsers className="text-blue-600 dark:text-blue-400" />}
            trend={{ value: 8.2, isPositive: true }} //temp-placeholder
          />
          <StatsCard
            title="Upcoming Events"
            value="6"
            icon={
              <FiCalendar className="text-emerald-600 dark:text-emerald-400" />
            }
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueChart
            data={monthlyRevenue}
            isLoading={isLoadingMonthly}
            error={null}
          />
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
