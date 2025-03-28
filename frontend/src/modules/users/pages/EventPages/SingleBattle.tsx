import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HomeLayout from "../../layout/HomeLayout";
import axiosInstance from "@/axios.config";
import EventCard from "../../components/Event/EventCard";
import SingleRegistration from "../../components/Event/SingleRegistration";

interface Event {
  _id: string;
  eventName: string;
  category: string;
  startDateTime: string;
  endDateTime: string;
  description: string;
  participationType: string;
  image: string;
  totalSpots: number;
  availableSpots: number;
}

const SingleBattle: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [countdown, setCountdown] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("/events/category/single-battle");
        setMsg(response.data.msg);
        if (response.data.success) {
          setEvents(response.data.data);
        } else {
          setError("Failed to fetch events. Please try again later.");
        }
      } catch (error) {
        setError("An error occurred while fetching events.");
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(selectedEvent.startDateTime).getTime();
        const distance = start - now;
  
        if (distance < 0) {
          clearInterval(interval);
          setCountdown("Event has started!");
        } else {
          // Calculate days
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          // Calculate hours remaining after days
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          // Include days in the countdown string
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }
  }, [selectedEvent]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleEmailSubmit = async () => {
    if (!selectedEvent || !email) {
      setSubmitError("Please enter an email address");
      return;
    }
  
    setIsSubmitting(true);
    setSubmitError(null);
  
    try {
      const response = await axiosInstance.post(`/events/${selectedEvent._id}/register`, { email });
      if (response.data.success) {
        alert("Verification email sent. Please check your inbox.");
        setEmail("");
      } else {
        setSubmitError(response.data.message || "Failed to send verification email");
      }
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      setSubmitError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmail("");
    setSubmitError(null);
  };


  return (
    <HomeLayout>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-2xl font-press font-normal mb-4 text-primary">
            Single Battle <span className="text-primary-dark">Events</span>
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        {error ? (
          <div className="text-red-500 text-center mt-8">
            {error}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event._id} className="relative flex flex-col items-center">
                <EventCard event={event} />
                <button
                  onClick={() => handleEventSelect(event)}
                  className="mt-4 px-6 py-2 bg-primary/90 hover:bg-primary text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-poppins text-sm font-medium"
                >
                  Register
                </button>
              </div>
            ))}
          </div>
        )}
        <SingleRegistration
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          email={email}
          countdown={countdown}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onEmailChange={handleEmailChange}
          onSubmit={handleEmailSubmit}
        />


      </div>
    </HomeLayout>
  );
};

export default SingleBattle;