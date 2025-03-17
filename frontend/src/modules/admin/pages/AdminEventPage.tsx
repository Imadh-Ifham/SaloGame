import React, { useState, useEffect } from "react";
import AdminEventCard from "../components/AdminEvent-page/AdminEventCard";
import EventForm from "../components/AdminEvent-page/EventForm";
import Modal from "@/components/Modal";
import axiosInstance from "@/axios.config";

const AdminEventPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  interface Event {
    _id: string;
    eventName: string;
    image: string;
    startDateTime: string;
    endDateTime: string;
    description: string;
    participationType: string; // Added participationType property
    numberOfTeams?: number;
    participationPerTeam?: number;
    totalSpots?: number;
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // new state variable


  useEffect(() => {
    // Fetch event data from the backend
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("/events"); // Ensure this endpoint is correct
        console.log("API Response:", response); // Log the entire response
        if (response.data.success) {
          console.log("API Data:", response.data.data); // Log the data
          setEvents(response.data.data);
        } else {
          console.error("API Error:", response.data.message);
          setError(response.data.message || "Failed to fetch events"); // set error message
          throw new Error(response.data.message || "Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to fetch events. Please check the console for details."); // set generic error message
      }
    };

    fetchEvents();
  }, []);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/events/${eventToDelete}`);
      if (response.data.success) {
        setEvents(events.filter((event) => event._id !== eventToDelete));
        setIsDeleteConfirmOpen(false);
        setEventToDelete(null);
      } else {
        console.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      if (editingEvent) {
        const response = await axiosInstance.put(`/events/${editingEvent._id}`, formData);
        if (response.data.success) {
          const updatedEvent = response.data.data;
          setEvents(events.map((event) => 
            event._id === updatedEvent._id ? updatedEvent : event
          ));
          setIsModalOpen(false);
          setEditingEvent(null);
        } else {
          setError(response.data.message || "Failed to update event");
        }
      } else {
        const response = await axiosInstance.post("/events", formData);
        if (response.data.success) {
          const newEvent = response.data.data;
          setEvents([...events, newEvent]);
          setIsModalOpen(false);
        } else {
          setError(response.data.message || "Failed to create event");
        }
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(error.response?.data?.message || "An unexpected error occurred");
    }
  };

  console.log("Events to render:", events);

  return (
    <div className="p-6">
      {error && ( // display error message if there is an error
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Events</h2>
        <button
          onClick={handleCreateEvent}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <AdminEventCard
            key={index}
            event={event}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? "Edit Event" : "Create New Event"}
      >
        <EventForm
          onSubmit={handleSubmit}
          initialData={editingEvent || undefined}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Delete">
          <div className="p-4">
            <p>Are you sure you want to delete this event?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminEventPage;