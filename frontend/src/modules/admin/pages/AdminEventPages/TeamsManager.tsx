import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axios.config.ts";
import { Button } from "@headlessui/react";
import { useParams } from "react-router-dom";
import Modal from "../../../../components/Modal.tsx";

interface Team {
  _id: string;
  teamName: string;
  members: { userId: string }[];
  maxMembers: number;
  createdBy: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Event {
  name: string;
}


const TeamsManager: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { eventId } = useParams<{ eventId: string }>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentTeam, setCurrentTeam] = useState<Partial<Team> | undefined>(undefined);
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [maxMembers, setMaxMembers] = useState<number>(10);
  const [eventName, setEventName] = useState<string>("");

  useEffect(() => {
    fetchTeams();
    fetchEvent();
  }, [eventId]);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse<Team[]>>(`/teams/${eventId}`);
      const responseData = response.data;
  
      if (responseData.success) {
        setTeams(responseData.data);
      } else {
        setError(responseData.message || "Failed to fetch teams.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvent = async () => { // Added fetchEvent function
    try {
      const response = await axiosInstance.get<ApiResponse<Event>>(`/events/${eventId}`);
      if (response.data.success) {
        setEventName(response.data.data.name);
      } else {
        setError(response.data.message || "Failed to fetch event.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    }
  };


  const handleCreateOrUpdateTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (currentTeam?._id) {
        response = await axiosInstance.put<ApiResponse<Team>>(`/teams/${currentTeam._id}`, {
          teamName: newTeamName,
          maxMembers,
        });
      } else {
        response = await axiosInstance.post<ApiResponse<Team>>("/teams", {
          teamName: newTeamName,
          eventId,
          maxMembers,
          createdBy: "64a32f3b6f10b5a10b34d672", // Example user ID
        });
      }
      const responseData = response.data;
  
      if (responseData.success) {
        fetchTeams();
        setIsModalOpen(false);
      } else {
        setError(responseData.message || "Failed to save the team.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteTeam = async (teamId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(`/teams/${teamId}`);
      const responseData = response.data;
  
      if (responseData.success) {
        fetchTeams();
      } else {
        setError(responseData.message || "Failed to delete the team.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-2xl font-press font-semibold mb-4 text-primary">
          Teams for Event {eventName}
        </h2>
        <Button
          className="px-4 py-2 bg-gamer-green text-white rounded-lg hover:bg-gamer-green-dark transition"
          onClick={() => {
            setCurrentTeam(undefined);
            setNewTeamName("");
            setMaxMembers(10);
            setIsModalOpen(true);
          }}
        >
          Create Team
        </Button>
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
              <Button
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                onClick={() => {
                  setCurrentTeam(team);
                  setNewTeamName(team.teamName);
                  setMaxMembers(team.maxMembers);
                  setIsModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                onClick={() => handleDeleteTeam(team._id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTeam ? "Edit Team" : "Create Team"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateOrUpdateTeam();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Team Name
            </label>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="mt-1 block w-full border border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Max Members
            </label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              className="mt-1 block w-full border border-gamer-green rounded-md shadow-sm p-2 focus:ring-gamer-green focus:border-gamer-green"
              required
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="ml-2 px-4 py-2 bg-gamer-green text-white rounded-lg hover:bg-gamer-green-dark transition"
            >
              {currentTeam ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamsManager;