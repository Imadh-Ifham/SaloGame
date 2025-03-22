import DashboardSummary from "../components/AdminOffer-page/DashboardSummary";
import QuickActions from "../components/AdminOffer-page/QuickActions";
import OfferManagement from "../components/AdminOffer-page/OfferManagement/OfferManagement";

const AdminOfferPage = () => {
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Gaming Cafe Offers
          </h1>
        </div>

        <DashboardSummary />
        <QuickActions />
        <div className="mt-8">
          <OfferManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminOfferPage;
