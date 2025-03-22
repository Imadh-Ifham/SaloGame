import React, { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiX, FiFilter } from 'react-icons/fi';
import { ITransaction } from '../../../../api/transactionService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TransactionReport from './TransactionReport';

interface TransactionListProps {
  transactions: ITransaction[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  onDateFilterChange?: (startDate: Date | null, endDate: Date | null) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onLoadMore,
  hasMore,
  isLoading = false,
  startDate: externalStartDate,
  endDate: externalEndDate,
  onDateFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalStartDate, setInternalStartDate] = useState<Date | null>(externalStartDate || null);
  const [internalEndDate, setInternalEndDate] = useState<Date | null>(externalEndDate || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'3mo' | '6mo' | '1yr'>('3mo');

  // Update internal dates when external dates change
  useEffect(() => {
    setInternalStartDate(externalStartDate || null);
    setInternalEndDate(externalEndDate || null);
  }, [externalStartDate, externalEndDate]);

  const handleStartDateChange = (date: Date | null) => {
    setInternalStartDate(date);
    if (onDateFilterChange) {
      onDateFilterChange(date, internalEndDate);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setInternalEndDate(date);
    if (onDateFilterChange) {
      onDateFilterChange(internalStartDate, date);
    }
  };

  const handleClearDateFilter = () => {
    setInternalStartDate(null);
    setInternalEndDate(null);
    if (onDateFilterChange) {
      onDateFilterChange(null, null);
    }
    setShowDatePicker(false);
  };

  const handleApplyDateFilter = () => {
    if (onDateFilterChange) {
      onDateFilterChange(internalStartDate, internalEndDate);
    }
    setShowDatePicker(false);
  };

  // Format date for display
  const formatDisplayDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      transaction.transactionType.toLowerCase().includes(searchLower) ||
      transaction.paymentType.toLowerCase().includes(searchLower) ||
      transaction.status.toLowerCase().includes(searchLower);
    
    // Client-side filtering only happens with the search term since date filtering is now handled by the server
    return matchesSearch;
  });

  const getStatusColor = (status: ITransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTransactionType = (type: ITransaction['transactionType']) => {
    switch (type) {
      case 'online-booking':
        return 'Online Booking';
      case 'walk-in-booking':
        return 'Walk-in Booking';
      case 'membership':
        return 'Membership';
      case 'refund':
        return 'Refund';
      default:
        return type;
    }
  };

  // Determine if there are active filters
  const hasActiveFilters = internalStartDate !== null || internalEndDate !== null;

  const handleGenerateReport = (period: '3mo' | '6mo' | '1yr') => {
    setReportPeriod(period);
    setShowReport(true);
    setShowReportOptions(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative">
            <button 
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowReportOptions(!showReportOptions)}
            >
              <FiDownload size={18} />
            </button>
            
            {showReportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-2">
                  <button
                    onClick={() => handleGenerateReport('3mo')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Last 3 Months
                  </button>
                  <button
                    onClick={() => handleGenerateReport('6mo')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Last 6 Months
                  </button>
                  <button
                    onClick={() => handleGenerateReport('1yr')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Last Year
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full sm:w-auto flex flex-col gap-2">
            <div className="relative flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              </div>
              
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
                  hasActiveFilters 
                    ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Filter by date"
              >
                <FiFilter size={16} />
                <span className="hidden sm:inline">Filter</span>
                {hasActiveFilters && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs">
                    {(internalStartDate && internalEndDate) ? '2' : '1'}
                  </span>
                )}
              </button>
            </div>
            
            {/* Active filters display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-2">
                {internalStartDate && (
                  <div className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-sm">
                    <span className="mr-1">From:</span> 
                    {formatDisplayDate(internalStartDate)}
                    <button 
                      onClick={() => handleStartDateChange(null)}
                      className="ml-1.5 hover:text-primary-dark"
                      aria-label="Clear start date"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}
                {internalEndDate && (
                  <div className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-sm">
                    <span className="mr-1">To:</span> 
                    {formatDisplayDate(internalEndDate)}
                    <button 
                      onClick={() => handleEndDateChange(null)}
                      className="ml-1.5 hover:text-primary-dark"
                      aria-label="Clear end date"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}
                {(internalStartDate || internalEndDate) && (
                  <button
                    onClick={handleClearDateFilter}
                    className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label="Clear all filters"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DatePicker Popover - Moved outside the header for better positioning */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowDatePicker(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true"></div>
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <div 
              className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-6 w-[300px] sm:w-[350px] mx-auto transform transition-all"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing the modal
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Date Range</h4>
                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close date picker"
                >
                  <FiX size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <DatePicker
                    selected={internalStartDate}
                    onChange={(date: Date | null) => setInternalStartDate(date)}
                    selectsStart
                    startDate={internalStartDate}
                    endDate={internalEndDate}
                    maxDate={new Date()}
                    placeholderText="Select start date"
                    className="w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm"
                    dateFormat="MMMM d, yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                  <DatePicker
                    selected={internalEndDate}
                    onChange={(date: Date | null) => setInternalEndDate(date)}
                    selectsEnd
                    startDate={internalStartDate}
                    endDate={internalEndDate}
                    minDate={internalStartDate || undefined}
                    maxDate={new Date()}
                    placeholderText="Select end date"
                    className="w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm"
                    dateFormat="MMMM d, yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
                <div className="flex justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleClearDateFilter}
                    className="px-3.5 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleApplyDateFilter}
                    className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                    disabled={!internalStartDate && !internalEndDate}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowReport(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Transaction Report - {reportPeriod === '3mo' ? 'Last 3 Months' : reportPeriod === '6mo' ? 'Last 6 Months' : 'Last Year'}
                </h3>
                <button
                  onClick={() => setShowReport(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="h-[calc(90vh-4rem)]">
                <TransactionReport
                  period={reportPeriod}
                  startDate={internalStartDate}
                  endDate={internalEndDate}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <FiSearch className="mx-auto text-gray-400 dark:text-gray-500 mb-3" size={24} />
            <p className="text-gray-600 dark:text-gray-400 mb-1">No transactions found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {searchTerm && "Try a different search term or "}
              {(internalStartDate || internalEndDate) && "adjust your date filters or "}
              try clearing your filters
            </p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid sm:grid-cols-12 text-xs text-gray-500 dark:text-gray-400 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="sm:col-span-4">TRANSACTION</div>
              <div className="sm:col-span-3">DATE & TIME</div>
              <div className="sm:col-span-2">PAYMENT</div>
              <div className="sm:col-span-1">STATUS</div>
              <div className="sm:col-span-2 text-right">AMOUNT</div>
            </div>
            
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="grid sm:grid-cols-12 gap-2 sm:gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-colors border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 items-center"
              >
                <div className="sm:col-span-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatTransactionType(transaction.transactionType)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 sm:hidden mt-1">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
                
                <div className="hidden sm:block sm:col-span-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(transaction.createdAt)}
                </div>
                
                <div className="sm:col-span-2">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {transaction.paymentType.toUpperCase()}
                  </span>
                </div>
                
                <div className="sm:col-span-1 flex items-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                
                <div className="sm:col-span-2 text-right font-medium text-gray-900 dark:text-white">
                  <span className={transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : ''}>
                    LKR {Math.abs(transaction.amount).toFixed(2)}
                    {transaction.amount < 0 && ' (Refund)'}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {hasMore && filteredTransactions.length > 0 && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full mt-6 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 border border-gray-200 dark:border-gray-600 font-medium"
        >
          {isLoading ? 'Loading...' : 'Load More Transactions'}
        </button>
      )}
    </div>
  );
};

export default TransactionList; 