import React from "react";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="text-center p-8">
    <p className="text-red-500">{message}</p>
  </div>
);
