import React, { useState, useEffect } from "react";
import HomeLayout from "../../layout/HomeLayout";
import axiosInstance from "../../../../axios.config";
import { Button } from "@headlessui/react";
import { useParams } from "react-router-dom";

interface Team {
  _id: string;
  teamName: string;
  members: { userId: string }[];
  maxMembers: number;
}

interface TeamRegistrationProps {
  userId: string; // Pass the user ID as a prop
}

const TeamRegistration: React.FC<TeamRegistrationProps> = ({ userId }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { eventId } = useParams<{ eventId: string }>(); // Fetch the event ID from the URL parameters
  const [event, setEvent] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}`);
      if (response.data.success) {
        setEvent(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch event.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/teams?eventId=${eventId}`);
      if (response.data.success) {
        setTeams(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch teams.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (teamId: string) => {
    try {
      const team = teams.find((team) => team._id === teamId);
      const members = team?.members ?? [];
      await axiosInstance.put(`/teams/${teamId}`, {
        members: [...members, { userId }],
      });
      fetchTeams();
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    }
  };

  const handleUndo = async (teamId: string) => {
    try {
      const team = teams.find((team) => team._id === teamId);
      if (team) {
        const updatedMembers = team.members.filter((member) => member.userId !== userId);
        await axiosInstance.put(`/teams/${teamId}`, { members: updatedMembers });
        fetchTeams();
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    }
  };

  return (
    <HomeLayout>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-2xl font-press font-semibold mb-4 text-primary">
            Team Registration for {event?.name}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Loading teams...
            </p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center mt-16">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 mt-16">
            {teams.map((team) => (
              <div
                key={team._id}
                className="relative p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-background dark:bg-background-dark border border-border-primary"
              >
                <h3 className="text-xl font-poppins font-semibold mb-2 text-text-primary">
                  {team.teamName}
                </h3>
                <p className="text-sm font-poppins text-text-secondary dark:text-neutral-50 mb-4">
                  Members: {team.members.length} / {team.maxMembers}
                </p>
                {team.members.some((member) => member.userId === userId) ? (
                  <Button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    onClick={() => handleUndo(team._id)}
                  >
                    Undo
                  </Button>
                ) : (
                  <Button
                    className="px-4 py-2 bg-gamer-green text-white rounded-lg hover:bg-gamer-green-dark transition"
                    onClick={() => handleRegister(team._id)}
                    disabled={team.members.length >= team.maxMembers}
                  >
                    Register
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default TeamRegistration;