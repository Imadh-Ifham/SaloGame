import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiChevronDown, FiChevronUp, FiHelpCircle, FiMessageSquare } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// Removed unused FeedbackForm import

interface FAQItem {
  question: string;
  answer: string;
}

const UserSupportDashboard: React.FC = () => {
  const navigate = useNavigate();
  const faqs: FAQItem[] = [
    {
      question: "How do I join a tournament?",
      answer: "Navigate to the Tournaments section, find an upcoming event, and click 'Register'. You'll need an active membership to participate."
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, bookings can be cancelled up to 24 hours before the scheduled time without penalty."
    },
    {
      question: "How are tournament rankings calculated?",
      answer: "Rankings are based on a combination of match wins, individual performance metrics, and opponent strength."
    },
    {
      question: "What happens if I'm late for my booking?",
      answer: "Your booking time will still end at the scheduled time. We recommend arriving at least 15 minutes early."
    }
  ];

  const [openFaqs, setOpenFaqs] = useState<number[]>([]);

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-100 flex items-center gap-1.5">
            <FiHelpCircle className="text-purple-400" size={14} />
            <span>Frequently Asked Questions</span>
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/support/feedback')}
            className="px-3 py-1.5 bg-emerald-500/20 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
          >
            <FiMessageSquare size={12} />
            Give Feedback
          </motion.button>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-700/50 last:border-0">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center py-3 text-left"
              >
                <span className="text-sm font-medium text-gray-200">{faq.question}</span>
                {openFaqs.includes(index) ? (
                  <FiChevronUp className="text-emerald-400" />
                ) : (
                  <FiChevronDown className="text-emerald-400" />
                )}
              </button>
              {openFaqs.includes(index) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pb-3 text-xs text-gray-400"
                >
                  {faq.answer}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default UserSupportDashboard;