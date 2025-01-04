import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axios.config";
import { Button } from "@headlessui/react";
import HomeLayout from "../../layout/HomeLayout";
import { useNavigate } from "react-router-dom";

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  image: string;
}

const EventPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/events");
      if (response.data.success) {
        setEvents(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch events.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-2xl font-press font-semibold mb-4 text-primary">
            Upcoming Events
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Loading events...
            </p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 mt-16">
            {events.map((event) => (
              <div
                key={event._id}
                className="relative p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-background dark:bg-background-dark border border-border-primary"
                style={{
                  backgroundImage: `url(${event.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  minHeight: "300px", // Ensures the card has a fixed height
                }}
              >
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10 text-white">
                  <h3 className="text-xl font-poppins font-semibold mb-2">
                    {event.name}
                  </h3>
                  <p className="text-sm font-poppins mb-4">
                    {event.description}
                  </p>
                  <p className="text-sm font-poppins mb-4 text-background-gamergreen">
                    Date : {event.date}
                  </p>
                  <p className="text-sm font-poppins mb-4 text-background-gamergreen">
                    Time : {event.time}
                  </p>
                  <Button
                    className="px-4 py-2 bg-gamer-green text-white rounded-lg hover:bg-gamer-green-dark transition"
                    onClick={() => navigate(`/team-registration/${event._id}`)}
                  >
                    Register now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default EventPage;
