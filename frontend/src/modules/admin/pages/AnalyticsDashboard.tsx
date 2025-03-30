// frontend/src/modules/admin/pages/AnalyticsDashboard.tsx
import React, { useState } from "react";
import { ArrowUpIcon, MagnifyingGlassIcon, ArrowDownIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const AnalyticsDashboard: React.FC = () => {
  const [isKeyEvent, setIsKeyEvent] = useState({
    first_visit: true,
    page_view: true,
    session_start: true
  });

  // Sample data for events
  const eventsData = [
    { name: "first_visit", count: 9, countChange: 12.5, users: 9, userChange: 12.5 },
    { name: "page_view", count: 1878, countChange: 137.1, users: 17, userChange: 54.5 },
    { name: "session_start", count: 306, countChange: 133.6, users: 17, userChange: 54.5 }
  ];

  return (
    <div className="space-y-6">
      {/* Events Table Section */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-lg font-medium text-white">Existing events</h2>
          <div className="flex space-x-2">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Modify event
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Create event
            </button>
          </div>
        </div>
        
        <div className="flex justify-end p-4">
          <div className="flex space-x-4">
            <button className="text-gray-400 hover:text-white">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Event name
                  <ArrowUpIcon className="h-4 w-4 inline ml-1" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Count
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  % change
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Users
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  % change
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Mark as key event
                  <span className="ml-1 text-gray-500 inline-block">?</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {eventsData.map((event) => (
                <tr key={event.name} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-green-500">
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                      {event.countChange}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-green-500">
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                      {event.userChange}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isKeyEvent[event.name as keyof typeof isKeyEvent]}
                        onChange={() => 
                          setIsKeyEvent({
                            ...isKeyEvent,
                            [event.name]: !isKeyEvent[event.name as keyof typeof isKeyEvent]
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts and Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-gray-400 border-b border-dashed border-gray-700 pb-1">User activity over time</h3>
            <div className="flex items-center text-gray-300 bg-gray-800 rounded-full p-1 pl-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
              <button className="h-5 w-5 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative h-64">
            {/* SVG for the line chart */}
            <svg className="w-full h-full" viewBox="0 0 600 240">
              {/* Y-axis labels */}
              <text x="580" y="20" className="text-xs fill-gray-400">20</text>
              <text x="580" y="80" className="text-xs fill-gray-400">15</text>
              <text x="580" y="140" className="text-xs fill-gray-400">10</text>
              <text x="580" y="200" className="text-xs fill-gray-400">5</text>
              <text x="580" y="240" className="text-xs fill-gray-400">0</text>
              
              {/* X-axis labels */}
              <text x="60" y="240" className="text-xs fill-gray-400">02</text>
              <text x="60" y="255" className="text-xs fill-gray-400">Mar</text>
              
              <text x="180" y="240" className="text-xs fill-gray-400">09</text>
              <text x="300" y="240" className="text-xs fill-gray-400">16</text>
              <text x="420" y="240" className="text-xs fill-gray-400">23</text>
              
              {/* Line chart for 30 days */}
              <path d="M50,120 L100,90 L150,110 L200,110 L250,110 L300,50 L350,30 L400,30 L450,40 L500,50 L550,30" 
                    stroke="#3b82f6" 
                    strokeWidth="2" 
                    fill="none" />
              
              {/* Line chart for 7 days */}
              <path d="M50,150 L100,120 L150,150 L200,165 L250,155 L300,100 L350,90 L400,90 L450,150 L500,150 L550,140" 
                    stroke="#8b5cf6" 
                    strokeWidth="2" 
                    fill="none" />
              
              {/* Line chart for 1 day */}
              <path d="M50,210 L100,170 L150,200 L200,180 L250,170 L300,80 L350,130 L400,140 L450,120 L500,140 L550,120" 
                    stroke="#ec4899" 
                    strokeWidth="2" 
                    fill="none" />
              
              {/* Points for 30 days */}
              <circle cx="420" cy="30" r="4" fill="#3b82f6" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="420" cy="30" r="6" fill="none" stroke="#3b82f6" strokeWidth="2" />
              
              {/* Points for 7 days */}
              <circle cx="350" cy="90" r="4" fill="#8b5cf6" stroke="#8b5cf6" strokeWidth="2" />
              <circle cx="400" cy="90" r="4" fill="#8b5cf6" stroke="#8b5cf6" strokeWidth="2" />
              <circle cx="350" cy="90" r="6" fill="none" stroke="#8b5cf6" strokeWidth="2" />
              <circle cx="400" cy="90" r="6" fill="none" stroke="#8b5cf6" strokeWidth="2" />
              
              {/* Points for 1 day */}
              <circle cx="200" cy="180" r="4" fill="#ec4899" stroke="#ec4899" strokeWidth="2" />
              <circle cx="200" cy="180" r="6" fill="none" stroke="#ec4899" strokeWidth="2" />
            </svg>
            
            {/* Legend */}
            <div className="absolute right-0 top-0 flex flex-col space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-xs text-blue-500">30 DAYS</span>
                <span className="text-xl text-white ml-4">17</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-xs text-purple-500">7 DAYS</span>
                <span className="text-xl text-white ml-4">9</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                <span className="text-xs text-pink-500">1 DAY</span>
                <span className="text-xl text-white ml-4">5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Users Stats */}
        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 border-b border-dashed border-gray-700 pb-1">ACTIVE USERS IN LAST 30 MINUTES</h3>
            <div className="flex items-center text-gray-300 bg-gray-800 rounded-full p-1 pl-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
              <button className="h-5 w-5 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mb-10">
            <h1 className="text-6xl text-white font-light">7</h1>
          </div>
          
          <h3 className="text-gray-400 mb-4">ACTIVE USERS PER MINUTE</h3>
          
          {/* Bar chart for active users per minute */}
          <div className="flex items-end h-16 mb-10 space-x-1">
            <div className="w-4 bg-blue-500 h-8"></div>
            <div className="w-4 bg-blue-500 h-12"></div>
            <div className="w-4 bg-blue-500 h-10"></div>
            <div className="w-4 bg-blue-500 h-14"></div>
            <div className="w-4 bg-blue-500 h-10"></div>
            <div className="w-4 bg-blue-500 h-6"></div>
            <div className="w-4 bg-blue-500 h-0"></div>
            <div className="w-4 bg-blue-500 h-0"></div>
            <div className="w-4 bg-blue-500 h-0"></div>
            <div className="w-4 bg-blue-500 h-0"></div>
            <div className="w-4 bg-blue-500 h-8"></div>
            <div className="w-4 bg-blue-500 h-8"></div>
            <div className="w-4 bg-blue-500 h-10"></div>
            <div className="w-4 bg-blue-500 h-12"></div>
            <div className="w-4 bg-blue-500 h-14"></div>
            <div className="w-4 bg-blue-500 h-12"></div>
          </div>
          
          <div className="flex justify-between">
            <h3 className="text-gray-400">TOP COUNTRIES</h3>
            <h3 className="text-gray-400">ACTIVE USERS</h3>
          </div>
          
          <div className="border-t border-gray-800 py-3 flex justify-between">
            <span className="text-gray-300">Sri Lanka</span>
            <span className="text-gray-300">7</span>
          </div>
          
          <div className="flex justify-end mt-4">
            <a href="#" className="text-blue-500 flex items-center">
              View realtime
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;