import React, { useState } from "react";
import { Modal, Select } from "antd";
import { DocumentArrowDownIcon } from "@heroicons/react/24/solid";

const { Option } = Select;

const BookingReportButton: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] =
    useState<string>("previous-month");

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    const reportUrl = `/booking-report?period=${selectedPeriod}`;
    window.open(reportUrl, "_blank"); // Open in new tab
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleChange = (value: string) => {
    setSelectedPeriod(value);
  };

  return (
    <>
      <button
        onClick={showModal}
        className="p-2 rounded-lg border-2 dark:border-gamer-green/20 text-gamer-green hover:bg-gamer-green/10 transition-colors"
      >
        <DocumentArrowDownIcon className="h-4 w-4" />
      </button>
      <Modal
        title="Select Report Period"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Select
          defaultValue="previous-month"
          style={{ width: "100%" }}
          onChange={handleChange}
        >
          <Option value="previous-month">Previous Month</Option>
          <Option value="last-3-months">Last 3 Months</Option>
          <Option value="last-6-months">Last 6 Months</Option>
          <Option value="last-year">Last Year</Option>
        </Select>
      </Modal>
    </>
  );
};

export default BookingReportButton;
