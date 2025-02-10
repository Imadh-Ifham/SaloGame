import DashboardSummary from "../components/AdminOffer-page/DashboardSummary";
import QuickActions from "../components/AdminOffer-page/QuickActions";
import OfferManagement from "../components/AdminOffer-page/OfferManagement/OfferManagement";

const AdminOfferPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Offer Management Admin Panel</h1>
      <DashboardSummary />
      <QuickActions />
      <div className="mt-8">
        <OfferManagement />
      </div>
    </div>
  );
};

export default AdminOfferPage;
