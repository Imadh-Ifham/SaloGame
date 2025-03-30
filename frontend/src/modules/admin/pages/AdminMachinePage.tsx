import React from "react";
import LayoutSection from "../components/AdminMachine-page/Blueprint/LayoutSection";
import MachineManage from "../components/AdminMachine-page/MachineManagement/MachineManage";

const AdminMachinePage: React.FC = () => {
  return (
    <section className="relative grid grid-cols-1 md:grid-cols-5 gap-4 h-screen">
      <div className="col-span-2 h-[calc(100vh-2rem)]">
        <LayoutSection />
      </div>
      <div className="col-span-3 h-[calc(100vh-2rem)]">
        <MachineManage />
      </div>
    </section>
  );
};

export default AdminMachinePage;
