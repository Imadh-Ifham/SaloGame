import React, { useEffect } from "react";
import LayoutSection from "../components/AdminBookings-page/Blueprint/LayoutSection";
import BookingPanel from "../components/AdminBookings-page/Booking-Panel";
import { useDispatch, useSelector } from "react-redux";
import { selectFetched } from "@/store/selectors/machineSelector";
import { fetchMachines } from "@/store/thunks/machineThunks";
import { AppDispatch } from "@/store/store";

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
      <div className="col-span-2 h-screen">
        <LayoutSection />
      </div>
      <div className="col-span-3 h-screen">
        <BookingPanel />
      </div>
    </section>
  );
};

export default AdminBookingManager;
