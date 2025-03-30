import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type AlertBoxProps = {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
};

const AlertBox: React.FC<AlertBoxProps> = ({
  title,
  message,
  type = "error",
  onClose,
}) => {
  const alertRef = useRef<HTMLDivElement | null>(null);

  const alertColors = {
    success: "border-green-500 text-green-600",
    error: "border-red-500 text-red-600",
    warning: "border-yellow-500 text-yellow-600",
    info: "border-blue-500 text-blue-600",
  };

  console.log("AlertBox rendered:", { title, message, type });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        alertRef.current &&
        !alertRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      role="alert"
      aria-live="assertive"
      ref={alertRef}
      className={`fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80 flex items-start gap-3 border-l-4 ${alertColors[type]}`}
    >
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-700">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-auto text-gray-500 hover:text-gray-800"
      >
        <X size={20} />
      </button>
    </motion.div>
  );
};

type AlertState = {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
} | null;

interface AlertProps {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
}

const Alert: React.FC<AlertProps> = ({ title, message, type }) => {
  const [alert, setAlert] = useState<AlertState>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message) {
      setAlert({ title, message, type });
      console.log("Alert triggered:", { title, message, type });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setAlert(null), 3000);
      console.log(alert);
    }
  }, [message]);

  return (
    <div>
      <AnimatePresence>
        {alert && (
          <AlertBox
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alert;
