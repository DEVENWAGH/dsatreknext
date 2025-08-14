'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Trophy, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DailyChallengeTimer from './DailyChallengeTimer';

const DailyChallengeCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [challenges, setChallenges] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const router = useRouter();
  const { data: session } = useSession();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const fetchChallenges = async () => {
    try {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const response = await fetch(`/api/daily-challenges?month=${monthKey}`);
      const data = await response.json();
      setChallenges(data.challenges || {});
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolvedProblems = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(
        `/api/submissions/solved?userId=${session.user.id}`
      );
      const data = await response.json();
      if (data.success) {
        const solvedIds = new Set(
          data.data.map(submission => submission.problemId)
        );
        setSolvedProblems(solvedIds);
      }
    } catch (error) {
      console.error('Failed to fetch solved problems:', error);
    }
  };

  useEffect(() => {
    fetchChallenges();
    fetchSolvedProblems();
  }, [currentDate, session]);

  const navigateMonth = direction => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = day => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasChallenge = day => {
    return challenges[day];
  };

  const isChallengeCompleted = day => {
    const challenge = challenges[day];
    return challenge?.problem?.id && solvedProblems.has(challenge.problem.id);
  };

  const handleDayClick = day => {
    const today = new Date();
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    if (clickedDate > today) return; // Don't allow future dates

    const challenge = challenges[day];
    if (challenge?.problem?.id) {
      router.push(`/workspace/${challenge.problem.id}`);
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const currentDay = today.getDate();

  return (
    <>
      {/* Calendar Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              DCC {monthNames[currentDate.getMonth()]}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Day {new Date().getDate()}
          </div>
        </div>
      </motion.button>

      {/* Calendar Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border rounded-lg p-4 shadow-lg max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-semibold">
                      DCC {monthNames[currentDate.getMonth()]}{' '}
                      {currentDate.getFullYear()}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Daily Coding Challenge
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <div
                    className="group relative block w-[62.4px] h-[70.2px]"
                    title={`DCC ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                  >
                    <img
                      alt={`DCC ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                      src={`https://assets.leetcode.com/static_assets/marketing/lg${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}.png`}
                      className="w-full h-full object-contain"
                    />
                    <svg
                      width="62.4"
                      height="70.2"
                      viewBox="0 0 66 74"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute inset-0 transition duration-500 ease-in-out group-hover:opacity-0 hidden lg:block"
                    >
                      <path
                        d="M30 2.73205C31.8564 1.66025 34.1436 1.66025 36 2.73205L61.1769 17.2679C63.0333 18.3397 64.1769 20.3205 64.1769 22.4641V51.5359C64.1769 53.6795 63.0333 55.6603 61.1769 56.7321L36 71.2679C34.1436 72.3397 31.8564 72.3397 30 71.2679L4.82309 56.7321C2.96668 55.6603 1.82309 53.6795 1.82309 51.5359V22.4641C1.82309 20.3205 2.96668 18.3397 4.82309 17.2679L30 2.73205Z M30 20C31.8564 18.9282 34.1436 18.9282 36 20L50 27V47L36 54C34.1436 55.0718 31.8564 55.0718 30 54L16 47V27L30 20Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        className="text-black opacity-80 dark:text-black dark:opacity-70"
                      ></path>
                    </svg>
                  </div>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-muted rounded transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-xs font-medium text-muted-foreground p-1"
                  >
                    {day}
                  </div>
                ))}

                {days.map((day, index) => (
                  <div key={index} className="relative aspect-square">
                    {day && (
                      <motion.div
                        onClick={() => handleDayClick(day)}
                        className={`
                          w-full h-full flex items-center justify-center text-xs font-medium rounded transition-all duration-200 relative
                          ${(() => {
                            const today = new Date();
                            const dayDate = new Date(
                              currentDate.getFullYear(),
                              currentDate.getMonth(),
                              day
                            );
                            const isFuture = dayDate > today;

                            if (isToday(day)) {
                              return 'bg-primary text-primary-foreground shadow-sm cursor-pointer';
                            } else if (hasChallenge(day) && !isFuture) {
                              return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer';
                            } else if (hasChallenge(day) && isFuture) {
                              return 'bg-gray-100 dark:bg-gray-800/30 text-gray-400 cursor-not-allowed';
                            } else {
                              return 'hover:bg-muted cursor-pointer';
                            }
                          })()}
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {day}

                        {/* Challenge indicator - Hexagon */}
                        {hasChallenge(day) && (
                          <div className="absolute -top-1 -right-1">
                            <svg
                              width="12"
                              height="14"
                              viewBox="0 0 66 74"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="transition duration-500 ease-in-out"
                            >
                              <path
                                d="M30 2.73205C31.8564 1.66025 34.1436 1.66025 36 2.73205L61.1769 17.2679C63.0333 18.3397 64.1769 20.3205 64.1769 22.4641V51.5359C64.1769 53.6795 63.0333 55.6603 61.1769 56.7321L36 71.2679C34.1436 72.3397 31.8564 72.3397 30 71.2679L4.82309 56.7321C2.96668 55.6603 1.82309 53.6795 1.82309 51.5359V22.4641C1.82309 20.3205 2.96668 18.3397 4.82309 17.2679L30 2.73205Z"
                                fill={
                                  isChallengeCompleted(day) ? '#22c55e' : 'none'
                                }
                                className="rounded-[2px]"
                              ></path>
                              <path
                                d="M30 2.73205C31.8564 1.66025 34.1436 1.66025 36 2.73205L61.1769 17.2679C63.0333 18.3397 64.1769 20.3205 64.1769 22.4641V51.5359C64.1769 53.6795 63.0333 55.6603 61.1769 56.7321L36 71.2679C34.1436 72.3397 31.8564 72.3397 30 71.2679L4.82309 56.7321C2.96668 55.6603 1.82309 53.6795 1.82309 51.5359V22.4641C1.82309 20.3205 2.96668 18.3397 4.82309 17.2679L30 2.73205Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                className={
                                  isChallengeCompleted(day)
                                    ? 'text-green-500'
                                    : 'text-gray-400 dark:text-gray-600'
                                }
                              ></path>
                            </svg>
                          </div>
                        )}

                        {/* Today indicator */}
                        {isToday(day) && (
                          <motion.div
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-white rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Weekly Premium Challenges */}
              <div className="mb-3">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-2 text-center">
                  Weekly Premium
                  <br />
                  {(() => {
                    const today = new Date();
                    const nextSunday = new Date(today);
                    nextSunday.setDate(
                      today.getDate() + ((7 - today.getDay()) % 7)
                    );
                    if (nextSunday.getTime() === today.getTime())
                      nextSunday.setDate(nextSunday.getDate() + 7);
                    const daysLeft = Math.ceil(
                      (nextSunday - today) / (1000 * 60 * 60 * 24)
                    );
                    return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
                  })()}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(() => {
                    const sundays = [];
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();

                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      if (date.getDay() === 0) {
                        // Sunday
                        sundays.push(day);
                      }
                    }

                    return Array.from({ length: 4 }, (_, index) => {
                      return (
                        <div key={index} className="text-center">
                          <div className="w-8 h-8 mx-auto flex items-center justify-center">
                            <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                              W{index + 1}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-muted-foreground">
                <div>
                  Day {currentDay} • <DailyChallengeTimer />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DailyChallengeCalendar;
