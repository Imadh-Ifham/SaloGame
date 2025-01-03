import React, { useState, useEffect } from "react";
import { Button } from "@headlessui/react";
import axiosInstance from "@/axios.config";
import Modal from "@/components/Modal";

interface Report {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    createdBy: "",
  });

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get("/reports");
        if (response.data.success) {
          setReports(response.data.data);
        } else {
          setError("Failed to fetch reports.");
        }
      } catch (err) {
        setError((err as Error).message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedReport) {
        await axiosInstance.put(`/reports/${selectedReport._id}`, formData);
      } else {
        await axiosInstance.post("/reports", formData);
      }
      setIsModalOpen(false);
      setSelectedReport(null);
      setFormData({ title: "", description: "", createdBy: "" });
      const response = await axiosInstance.get("/reports");
      setReports(response.data.data);
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    }
  };

  const handleEdit = (report: Report) => {
    setSelectedReport(report);
    setFormData({ title: report.title, description: report.description, createdBy: report.createdBy });
    setIsModalOpen(true);
  };

  const handleDelete = async (reportId: string) => {
    try {
      await axiosInstance.delete(`/reports/${reportId}`);
      setReports((prev) => prev.filter((report) => report._id !== reportId));
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-background dark:bg-background-dark text-foreground dark:text-foreground">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manage Reports</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded">
          Create Report
        </Button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <table className="min-w-full bg-card dark:bg-card">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td className="py-2 px-4 border-b">{report.title}</td>
                <td className="py-2 px-4 border-b">{report.description}</td>
                <td className="py-2 px-4 border-b">
                  <Button onClick={() => handleEdit(report)} className="bg-secondary text-secondary-foreground px-2 py-1 rounded mr-2">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(report._id)} className="bg-destructive text-destructive-foreground px-2 py-1 rounded">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedReport ? "Edit Report" : "Create Report"}>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-foreground">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-input dark:border-input rounded-md shadow-sm p-2 bg-black text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-foreground">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-input dark:border-input rounded-md shadow-sm p-2 bg-black text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-foreground">Created By</label>
            <input
              type="text"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-input dark:border-input rounded-md shadow-sm p-2 bg-black text-foreground"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground px-4 py-2 rounded">
              {selectedReport ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminReportsPage;