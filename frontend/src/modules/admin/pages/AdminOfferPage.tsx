import DashboardSummary from "../components/AdminOffer-page/DashboardSummary";
import QuickActions from "../components/AdminOffer-page/QuickActions";
import OfferManagement from "../components/AdminOffer-page/OfferManagement/OfferManagement";

const AdminOfferPage = () => {
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-white dark:bg-background-dark">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Offer Management Admin Panel</h1>
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
