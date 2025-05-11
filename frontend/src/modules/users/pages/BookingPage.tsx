import React, { useEffect, useState } from "react";
import HomeLayout from "../layout/HomeLayout";
import LayoutSection from "../components/booking/Blueprint/LayoutSection";
import { fetchMachines } from "@/store/thunks/machineThunks";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchMachineStatus } from "@/store/thunks/bookingThunk";
import { getCurrentUTC } from "@/utils/date.util";
import { selectFetched } from "@/store/selectors/machineSelector";
import CheckAvailability from "../components/booking/booking-panel/CheckAvailability";
import { updateBookingForm } from "@/store/slices/bookingSlice";
import { setMoreMachine } from "@/store/slices/layoutSlice";
import SelectedMachineDetail from "../components/booking/booking-panel/SelectedMachineDetail";
import BookingForm from "../components/booking/booking-panel/BookingForm";
import BookingDetails from "../components/booking/booking-panel/BookingDetails";

const BookingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const fetched = useSelector(selectFetched);
  const [activeTab, setActiveTab] = useState("machine-details");

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

  useEffect(() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    dispatch(updateBookingForm({ startTime: date.toISOString() }));
    dispatch(setMoreMachine(true));

    return () => {
      // This runs when the component unmounts
      dispatch(setMoreMachine(false));
    };
  }, [dispatch]);

  return (
    <HomeLayout>
      <div className="flex justify-between h-full w-full max-w-[1200px] mx-auto px-4 py-4 gap-4">
        <div />
        <LayoutSection />
        <div className="flex-1 flex-col relative w-full max-w-[400px] dark:bg-gray-800 p-4 my-7 rounded-lg bg-slate-200 ">
          {activeTab === "machine-details" && (
            <>
              <CheckAvailability />
              <SelectedMachineDetail setActiveTab={setActiveTab} />
            </>
          )}
          {activeTab === "customer-details" && (
            <BookingForm setActiveTab={setActiveTab} />
          )}
          {activeTab === "display-details" && (
            <BookingDetails setActiveTab={setActiveTab} />
          )}
        </div>
        <div />
      </div>
    </HomeLayout>
  );
};

export default BookingPage;
