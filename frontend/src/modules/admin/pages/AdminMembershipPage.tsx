import DashboardSummary from "../components/AdminMembership-page/DashboardSummary";
import MemberManagement from "../components/AdminMembership-page/MemberManagement";
import MembershipTypeManagement from "../components/AdminMembership-page/MembershipTypeManagement";
import QuickActions from "../components/AdminMembership-page/QuickActions";
import { FaGamepad, FaHeadset } from "react-icons/fa";

export default function AdminMembershipPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
          <FaGamepad className="text-4xl text-purple-500 mr-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Gaming Cafe Membership Portal
          </h1>
        </div>

        <DashboardSummary />
        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <MembershipTypeManagement />
          <MemberManagement />
        </div>
      </div>
    </div>
  );
}
