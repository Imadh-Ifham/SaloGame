import React from "react";
import { FaEdit, FaTrash, FaCalendarPlus } from "react-icons/fa";

interface AdminEventCardProps {
  events: Array<{
    _id: string;
    eventName: string;
    category: string;
    startDateTime: string;
    endDateTime: string;
    numberOfTeams?: number;
    participationPerTeam?: number;
    totalSpots?: number;
    availableSpots?: number;
  }>;
  onEdit: (event: any) => void;
  onDelete: (eventId: string) => void;
  onCreateEvent: () => void;
}

const AdminEventCard: React.FC<AdminEventCardProps> = ({ 
  events, 
  onEdit, 
  onDelete,
  onCreateEvent 
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-green-500">
      {/* Header with Title and Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          <FaCalendarPlus className="mr-2 text-green-500" />
          Event List
        </h2>
        <button
          onClick={onCreateEvent}
          className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 
                   text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-300 
                   shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <FaCalendarPlus className="mr-2" /> Create Event
        </button>
      </div>

      {/* Events List */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-700 border-b border-gray-600">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Event Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Teams/Spots
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {event.eventName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                    {event.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(event.startDateTime).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {event.category === 'team-battle' 
                    ? `${event.numberOfTeams || 0} teams (${event.participationPerTeam || 0} per team)`
                    : `${event.totalSpots || 0} spots`
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onEdit(event)}
                      className="text-green-400 hover:text-green-300 bg-gray-800 p-2 rounded-lg transition-colors duration-200"
                      title="Edit Event"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(event._id)}
                      className="text-red-400 hover:text-red-300 bg-gray-800 p-2 rounded-lg transition-colors duration-200"
                      title="Delete Event"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEventCard;