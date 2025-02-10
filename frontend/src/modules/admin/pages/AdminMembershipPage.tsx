import DashboardSummary from "../components/AdminMembership-page/DashboardSummary";
import MemberManagement from "../components/AdminMembership-page/MemberManagement";
import MembershipTypeManagement from "../components/AdminMembership-page/MembershipTypeManagement";
import QuickActions from "../components/AdminMembership-page/QuickActions";

export default function AdminMembershipPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">
        Membership Management Admin Panel
      </h1>
      <DashboardSummary />
      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <MembershipTypeManagement />
        <MemberManagement />
      </div>
    </div>
  );
}
