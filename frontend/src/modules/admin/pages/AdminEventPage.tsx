import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { 
  CalendarIcon, 
  UserGroupIcon, 
  PlayIcon, 
  ChartBarIcon 
} from "@heroicons/react/24/outline";
import AdminEventCard from "../components/AdminEvent-page/AdminEventCard";
import EventForm from "../components/AdminEvent-page/EventForm";
import Modal from "@/components/Modal";
import axiosInstance from "@/axios.config";
import { motion } from "framer-motion";
import UpcomingEventsSection from '../components/AdminEvent-page/UpcomingEventSection';
import ParticipantsTab  from '../components/AdminEvent-page/ParticipantsTab';
import ReportsAnalyticsTab  from '../components/AdminEvent-page/ReportsAnalyticsTab';
import LiveEventsTab  from '../components/AdminEvent-page/LiveEventsTab';

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
    category: string; // Added category property
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
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center sm:text-left mb-8"
      >
        <h2 className="text-3xl sm:text-2xl font-press font-semibold text-primary">
          Manage Our <span className="text-gray-900 dark:text-white">Events</span>
        </h2>
        <div className="w-16 sm:w-24 h-1 bg-primary mx-auto sm:mx-0 rounded-full mt-4" />
      </motion.div>
      
      <Tab.Group>
        <Tab.List className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          <Tab
            className={({ selected }) =>
              `px-4 py-2 font-medium text-sm focus:outline-none ${
                selected
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Event Management</span>
            </div>
          </Tab>

          <Tab
            className={({ selected }) =>
              `px-4 py-2 font-medium text-sm focus:outline-none ${
                selected
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5" />
              <span>Participants</span>
            </div>
          </Tab>

          <Tab
            className={({ selected }) =>
              `px-4 py-2 font-medium text-sm focus:outline-none ${
                selected
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center space-x-2">
              <PlayIcon className="w-5 h-5" />
              <span>Live Events</span>
            </div>
          </Tab>

          <Tab
            className={({ selected }) =>
              `px-4 py-2 font-medium text-sm focus:outline-none ${
                selected
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`
            }
          >
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Reports & Analytics</span>
            </div>
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* Event Management Panel */}
          <Tab.Panel>
          <UpcomingEventsSection
            events={events.map((event) => ({
              ...event,
              category: event.category as "team-battle" | "single-battle",
            }))}
          />
            <AdminEventCard
              events={events}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onCreateEvent={handleCreateEvent}
            />
          </Tab.Panel>

          {/* Participants Panel */}
          <Tab.Panel>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Event Participants</h2>
              <ParticipantsTab />
            </div>
          </Tab.Panel>

          {/* Live Events Panel */}
          <Tab.Panel>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Live Events</h2>
              <LiveEventsTab />
            </div>
          </Tab.Panel>

          {/* Reports & Analytics Panel */}
          <Tab.Panel>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">

              <ReportsAnalyticsTab teams={[]} />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Existing Modals */}
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
          initialData={
            editingEvent
              ? {
                  ...editingEvent,
                  category: editingEvent.category as "team-battle" | "single-battle" | undefined,
                }
              : undefined
          }
          onCancel={() => setIsModalOpen(false)}
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