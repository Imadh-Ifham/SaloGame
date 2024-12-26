import React from "react";
import { Outlet } from "react-router-dom";

const AdminLayout: React.FC = () => {
  return (
    <div>
      <main>
        <Outlet /> {/* Render child routes here */}
      </main>
    </div>
  );
};

export default AdminLayout;
