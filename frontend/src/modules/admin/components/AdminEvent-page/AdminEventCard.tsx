import React from "react";

interface AdminEventCardProps {
  event: {
    _id: string;
    eventName: string;
    image: string;
    startDateTime: string;
    endDateTime: string;
    participationType: string;
    numberOfTeams?: number;
    participationPerTeam?: number;
    totalSpots?: number;
  };
  onEdit: (event: any) => void;
  onDelete: (eventId: string) => void;
}

const AdminEventCard: React.FC<AdminEventCardProps> = ({ event, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
      <img src={event.image} alt={event.eventName} className="w-full h-40 object-cover rounded-lg mb-4" />
      <h3 className="text-xl font-semibold mb-2">{event.eventName}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-2">
        <strong>Start:</strong> {new Date(event.startDateTime).toLocaleString()}
      </p>
      <p className="text-gray-600 dark:text-gray-300 mb-2">
        <strong>End:</strong> {new Date(event.endDateTime).toLocaleString()}
      </p>
      <p className="text-gray-600 dark:text-gray-300 mb-2">
        <strong>Participation Type:</strong> {event.participationType}
      </p>
      {event.numberOfTeams && (
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          <strong>Number of Teams:</strong> {event.numberOfTeams}
        </p>
      )}
      {event.participationPerTeam && (
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          <strong>Participation Per Team:</strong> {event.participationPerTeam}
        </p>
      )}
      {event.totalSpots && (
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          <strong>Total Spots:</strong> {event.totalSpots}
        </p>
      )}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onEdit(event)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(event._id)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AdminEventCard;