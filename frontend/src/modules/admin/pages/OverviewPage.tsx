import React from "react";
import DateSelector from "../components/AdminBookings-page/Booking-Panel/DateSelector";

const OverviewPage: React.FC = () => {
  return (
    <section className="h-screen w-full flex flex-col items-center justify-center">
      <div>Overview Page is yet to be designed!</div>
      <DateSelector activeNav="Later" />
    </section>
  );
};

export default OverviewPage;
