import React from "react";


export interface Booking {
    _id: string;
    date: Date;
    time: string;
    name: string;
    phone: number;
    email: string;
    
  }

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        
        <span>{new Date(booking.date).toLocaleDateString()}</span>
        <span>{booking.time}</span>
        <span>{booking.name}</span>
        <span>{booking.phone}</span>
        <span>{booking.email}</span>
       
      </div>
    </div>
  );
};

export default BookingCard;
