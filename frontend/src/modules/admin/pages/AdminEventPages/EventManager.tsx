import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axios.config";
import Modal from "../../../../components/Modal";
import { Button } from "@headlessui/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  image: string;
}

const EventManagerPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event> | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse<Event[]>>("/events");
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

  const handleCreateOrUpdateEvent = async (event: Partial<Event>) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (event._id) {
        response = await axiosInstance.put<ApiResponse<null>>(`/events/${event._id}`, event);
      } else {
        response = await axiosInstance.post<ApiResponse<null>>("/events", event);
      }
      if (response.data.success) {
        fetchEvents();
        setIsModalOpen(false);
      } else {
        setError(response.data.message || "Failed to save the event.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(`/events/${eventId}`);
      if (response.data.success) {
        fetchEvents();
      } else {
        setError(response.data.message || "Failed to delete the event.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto text-center mb-12 sm:mb-16 flex justify-between items-center">
        <h2 className="text-3xl sm:text-2xl font-press font-semibold mb-4 text-primary">
          Manage Events
        </h2>
        <Button
          onClick={() => {
            setCurrentEvent(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-gamer-green text-white rounded-lg hover:bg-gamer-green transition-all duration-300"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Event
        </Button>
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
              className="flex group relative p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-background dark:bg-background-dark border border-border-primary"
            >
              <div className="ml-6 flex flex-col justify-between w-2/3">
                <div>
                  <h3 className="text-xl font-poppins font-semibold mb-2 text-text-primary">
                    {event.name}
                  </h3>
                  <p className="text-sm font-poppins text-text-secondary dark:text-neutral-50 mb-4">
                    {event.description}
                  </p>
                  <p className="text-sm font-poppins text-text-secondary dark:text-neutral-50 mb-4">
                    {event.date} {event.time}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => {
                      setCurrentEvent(event);
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-gamer-green text-white rounded hover:bg-gamer-green-dark transition"
                    title="Edit Event"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    title="Delete Event"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => navigate(`/admin/teams/${event._id}`)}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    title="View Teams"
                  >
                    View Teams
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEvent ? "Edit Event" : "Create Event"}
      >
        <EventForm
          initialData={currentEvent}
          onSuccess={(event) => {
            handleCreateOrUpdateEvent(event);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

interface EventFormProps {
  initialData?: Partial<Event>;
  onSuccess: (event: Partial<Event>) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  initialData = {},
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [date, setDate] = useState(initialData.date || "");
  const [time, setTime] = useState(initialData.time || "");
  const [image, setImage] = useState(initialData.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !description || !date || !time || !image) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    onSuccess({ _id: initialData._id, name, description, date, time, image });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Description<span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full border border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
          rows={4}
          required
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Date<span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full border border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Time<span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 block w-full border border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Image URL<span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="mt-1 block w-full border border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-gamer-green text-white rounded hover:bg-gamer-green transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {initialData._id ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
};

export default EventManagerPage;