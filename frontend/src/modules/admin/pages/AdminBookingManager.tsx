import React, { useEffect } from "react";
import LayoutSection from "../components/Overview-page/LayoutSection";
import BookingPanel from "../components/Overview-page/BookingPanel";
import { useDispatch, useSelector } from "react-redux";
import { selectFetched } from "@/store/selectors/machineSelector";
import { fetchMachines } from "@/store/thunks/machineThunks";
import { AppDispatch } from "@/store/store";
import BookingOverview from "../components/Overview-page/BookingOverview";

const AdminBookingManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const fetched = useSelector(selectFetched);

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchMachines());
    }
  }, [dispatch, fetched]);

  return (
    <section className="grid grid-cols-5 h-screen">
      <div className="col-span-2 h-full">
        <LayoutSection />
      </div>
      <div className="grid grid-cols-5 grid-rows-2 col-span-3 h-screen">
        <BookingPanel />
        <BookingOverview />
      </div>
    </section>
  );
};

export default AdminBookingManager;
