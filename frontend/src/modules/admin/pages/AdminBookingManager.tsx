import React, { useEffect, useState } from "react";
import LayoutSection from "../components/AdminBookings-page/Blueprint/LayoutSection";
import BookingPanel from "../components/AdminBookings-page/Booking-Panel";
import { useDispatch, useSelector } from "react-redux";
import { selectFetched } from "@/store/selectors/machineSelector";
import { fetchMachines } from "@/store/thunks/machineThunks";
import { AppDispatch } from "@/store/store";
import { fetchMachineStatus } from "@/store/thunks/bookingThunk";
import { getCurrentUTC } from "@/utils/date.util";
import { FiCalendar, FiClock } from "react-icons/fi";
import BookingHistory from "../components/AdminBookings-page/Booking-History/BookingHistory";
import BookingDetail from "../components/AdminBookings-page/Booking-History/BookingDetail";

const AdminBookingManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [view, setView] = useState<"booking" | "history">("booking");
  const fetched = useSelector(selectFetched);

  useEffect(() => {
    const fetchData = async () => {
      if (!fetched) {
        await dispatch(fetchMachines());
        await dispatch(
          fetchMachineStatus({ startTime: getCurrentUTC(), duration: 60 })
        );
      }
    };

    fetchData(); // Call the async function
  }, [dispatch, fetched]);

  return (
    <section className="relative grid grid-cols-1 md:grid-cols-5 gap-4 p-4 h-screen">
      {view === "booking" ? (
        <>
          <div className="col-span-2 h-[calc(100vh-2rem)]">
            <LayoutSection />
          </div>
          <div className="col-span-3 h-[calc(100vh-2rem)]">
            <BookingPanel />
          </div>
        </>
      ) : (
        <>
          <div className="col-span-1 md:col-span-2 h-[calc(100vh-2rem)]">
            <BookingDetail />
          </div>
          <div className="col-span-1 md:col-span-3 h-[calc(100vh-2rem)]">
            <BookingHistory />
          </div>
        </>
      )}
      {/* Top-right fixed icons */}
      <div className="absolute top-8 right-10 flex space-x-4 rounded-lg ">
        <button
          className={`p-1 hover:bg-gray-200 dark:bg-gray-50 rounded border shadow-md ${
            view === "booking" ? "bg-gray-200 dark:bg-gamer-green/100" : ""
          }`}
          onClick={() => setView("booking")}
        >
          <FiClock className="w-4 h-4 text-gray-700" />
        </button>
        <button
          className={`p-1 hover:bg-gray-200 dark:bg-gray-50 rounded border shadow-md ${
            view === "history" ? "bg-gray-200 dark:bg-gamer-green/100" : ""
          }`}
          onClick={() => setView("history")}
        >
          <FiCalendar className="w-4 h-4 text-gray-700" />
        </button>
      </div>
    </section>
  );
};

export default AdminBookingManager;
