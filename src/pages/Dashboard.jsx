import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getTeamsByCoach,
  getPlayersByUser,
  getTeamsForParent,
} from "../services/db";
import { getUpcomingEvents, EVENT_TYPES } from "../services/events";
import useAuth from "../contexts/useAuth";
import AttendanceModal from "../components/AttendanceModal";
import AttendanceViewModal from "../components/AttendanceViewModal";
import EventCard from "../components/EventCard";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAttendanceViewModal, setShowAttendanceViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        if (user.role === "parent") {
          // Load parent-specific data
          const [userPlayers, userTeams, events] = await Promise.all([
            getPlayersByUser(user.uid),
            getTeamsForParent(user.uid),
            getUpcomingEvents(10), // Load more events to filter
          ]);
          setPlayers(userPlayers);
          setTeams(userTeams);

          // Filter events for parents - only show events where their children are participants
          const childPlayerIds = userPlayers.map((player) => player.id);
          const filteredEvents = events
            .filter((event) => {
              const hasParticipatingChild =
                event.participantIds &&
                event.participantIds.some((participantId) =>
                  childPlayerIds.includes(participantId)
                );
              return hasParticipatingChild;
            })
            .slice(0, 3); // Take only first 3 after filtering

          setUpcomingEvents(filteredEvents);
        } else {
          // Load coach/superadmin data (existing logic)
          const [userTeams, events] = await Promise.all([
            getTeamsByCoach(user.uid),
            getUpcomingEvents(3),
          ]);
          setTeams(userTeams);
          setPlayers([]); // Coaches don't need global player count on dashboard
          setUpcomingEvents(events);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setTeams([]);
        setPlayers([]);
        setUpcomingEvents([]);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleAttendanceClick = (event) => {
    setSelectedEvent(event);
    setShowAttendanceModal(true);
  };

  const handleAttendanceViewClick = (event) => {
    setSelectedEvent(event);
    setShowAttendanceViewModal(true);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 animate-fadeIn"
      style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "none" }}
    >
      {/* Header with User Info - Hidden on desktop, visible on mobile without logout */}
      <header className="lg:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-primary-100 dark:border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center space-x-4 animate-slideDown">
              <div>
                <p className="text-lg font-medium bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
                  {user?.name || user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-120px)]">
        {/* Quick Stats Cards - Compact Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-slideUp">
          {/* Teams Card */}
          <Link
            to="/teams"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-primary-100 dark:border-primary-800/30 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg group-hover:scale-105 transition-transform">
                  <svg
                    className="h-6 w-6 text-primary-600 dark:text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {user.role === "parent" ? "Ομάδες Παιδιών" : "Ομάδες"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {teams.length}
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          {/* Players Card */}
          <Link
            to="/players"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-secondary-100 dark:border-secondary-800/30 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/30 dark:to-secondary-800/30 shadow-lg group-hover:scale-105 transition-transform">
                  <svg
                    className="h-6 w-6 text-secondary-600 dark:text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {user.role === "parent" ? "Τα Παιδιά μου" : "Παίκτες"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.role === "parent"
                      ? players.length
                      : teams.reduce(
                          (total, team) => total + (team.members || []).length,
                          0
                        )}
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400 group-hover:text-secondary-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          {/* Events Card */}
          <Link
            to="/events"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-success-100 dark:border-success-800/30 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 shadow-lg group-hover:scale-105 transition-transform">
                  <svg
                    className="h-6 w-6 text-success-600 dark:text-success-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Επόμενα Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {upcomingEvents.length}
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400 group-hover:text-success-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>

        {/* Upcoming Events Widget */}
        {upcomingEvents.length > 0 && (
          <div className="mb-8 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <svg
                  className="h-6 w-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Επερχόμενα Events</span>
              </h2>
              <Link
                to="/events"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center space-x-1"
              >
                <span>Προβολή όλων</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  teams={teams}
                  user={user}
                  onAttendanceClick={handleAttendanceClick}
                  onAttendanceViewClick={handleAttendanceViewClick}
                  showDeleteButton={false}
                  compact={false}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Attendance Modal for Parents */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        userPlayers={players.filter((player) =>
          selectedEvent?.participantIds?.includes(player.id)
        )}
        onAttendanceSubmitted={() => {
          // Could refresh events or show success message
        }}
      />

      {/* Attendance View Modal for Coaches/Admins */}
      <AttendanceViewModal
        isOpen={showAttendanceViewModal}
        onClose={() => {
          setShowAttendanceViewModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </div>
  );
}
