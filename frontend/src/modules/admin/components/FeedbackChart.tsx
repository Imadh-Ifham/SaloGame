import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Feedback {
    type: 'feedback' | 'suggestion';
    category: string;
  }
  
  interface FeedbackChartProps {
    feedbacks: Feedback[];
  }

const FeedbackChart: React.FC<FeedbackChartProps> = ({ feedbacks }) => {
  const prepareChartData = () => {
    const categories = ['general', 'service', 'facility', 'games', 'events'];
    const feedbackData = categories.map(category => 
      feedbacks.filter(f => f.type === 'feedback' && f.category === category).length
    );
    const suggestionData = categories.map(category => 
      feedbacks.filter(f => f.type === 'suggestion' && f.category === category).length
    );

    return {
      labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
      datasets: [
        {
          label: 'Feedbacks',
          data: feedbackData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Suggestions',
          data: suggestionData,
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Category Distribution
      </h3>
      <div className="h-[300px]">
        <Line
          data={prepareChartData()}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(75, 85, 99, 0.1)'
                },
                ticks: {
                  color: '#9CA3AF'
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#9CA3AF'
                }
              }
            },
            plugins: {
              legend: {
                position: 'top' as const,
                labels: {
                  color: '#9CA3AF'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default FeedbackChart;