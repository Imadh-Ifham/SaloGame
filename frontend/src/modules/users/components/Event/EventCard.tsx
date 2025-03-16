import React from "react";

interface EventCardProps {
  event: {
    _id: string;
    eventName: string;
    category: string;
    startDateTime: string;
    endDateTime: string;
    description: string;
    numberOfTeams?: number;
    participationPerTeam?: number;
    image: string;
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="relative bg-gray-900 text-white rounded-lg overflow-hidden shadow-lg">
      {/* Event Image */}
      <div className="relative">
        <img
          src={event.image}
          alt={event.eventName}
          className="w-full h-48 object-cover brightness-75 transition-transform hover:scale-105"
        />
        {/* Date Overlay */}
        <div className="absolute top-4 left-4 bg-blue-600 px-3 py-2 text-center rounded-md shadow-md">
          <p className="text-lg font-bold">{new Date(event.endDateTime).getDate()}</p>
          <p className="text-sm uppercase">{new Date(event.endDateTime).toLocaleString("en-US", { month: "short" })}</p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold mb-1">{event.eventName}</h3>
        <p className="text-gray-400 text-sm mb-2">{event.category}</p>

        <p className="text-gray-300 text-sm">
          <strong>Start:</strong> {new Date(event.startDateTime).toLocaleString()}
        </p>
        <p className="text-gray-300 text-sm mb-2">
          <strong>End:</strong> {new Date(event.endDateTime).toLocaleString()}
        </p>

        <p className="text-gray-300 text-sm">
          {event.description}
        </p>

        {event.numberOfTeams && (
          <p className="text-gray-300 text-sm">
            <strong>Teams:</strong> {event.numberOfTeams}
          </p>
        )}
        {event.participationPerTeam && (
          <p className="text-gray-300 text-sm mb-3">
            <strong>Players per Team:</strong> {event.participationPerTeam}
          </p>
        )}

      </div>
    </div>
  );
};

export default EventCard;
