"use client";

import { useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ShowingServicePage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📅</span> Showing Service
        </h1>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
            <span>+</span> Schedule Showing
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
            <span>🔑</span> Lockbox Access
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today", value: 0, icon: "📋" },
          { label: "Upcoming", value: 0, icon: "📅" },
          { label: "Pending Approval", value: 0, icon: "⏳" },
          { label: "My Listings", value: 6, icon: "🏠" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1c1c2e] rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1 bg-[#1c1c2e] rounded-lg p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="text-gray-400 hover:text-white px-3 py-1 rounded transition-colors"
            >
              &lt;
            </button>
            <h2 className="text-lg font-semibold text-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={nextMonth}
              className="text-gray-400 hover:text-white px-3 py-1 rounded transition-colors"
            >
              &gt;
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-blue-600 text-white"
                  : "bg-[#161620] text-gray-400 hover:text-white"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-[#161620] text-gray-400 hover:text-white"
              }`}
            >
              List
            </button>
          </div>

          {viewMode === "calendar" ? (
            <div>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center rounded text-sm transition-colors ${
                      day === null
                        ? ""
                        : isToday(day)
                        ? "bg-blue-600 text-white font-bold"
                        : "text-gray-300 hover:bg-[#161620] cursor-pointer"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm py-8 text-center">
              No showings scheduled for {MONTH_NAMES[currentMonth]} {currentYear}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Today's Showings */}
          <div className="bg-[#1c1c2e] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Today&apos;s Showings</h3>
            <p className="text-gray-500 text-sm">No showings scheduled</p>
          </div>

          {/* Pending Approval */}
          <div className="bg-[#1c1c2e] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Pending Approval</h3>
            <p className="text-gray-500 text-sm">No pending requests</p>
          </div>

          {/* My Listings */}
          <div className="bg-[#1c1c2e] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">My Listings</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-300 hover:text-white cursor-pointer transition-colors">
                1536 Mission Meadows Rd
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
