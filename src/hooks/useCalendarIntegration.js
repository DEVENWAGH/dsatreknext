'use client';

/**
 * Custom hook for Google Calendar integration
 * @returns {Object} Calendar integration functions
 */
export function useCalendarIntegration() {
  /**
   * Add a single contest to Google Calendar
   * @param {Object} contest - Contest object with title, description, startDate, and endDate
   */
  const addContestToCalendar = contest => {
    if (!contest) return;

    const startTime = new Date(contest.startDate)
      .toISOString()
      .replace(/-|:|\\.\\d+/g, '');
    const endTime = new Date(contest.endDate)
      .toISOString()
      .replace(/-|:|\\.\\d+/g, '');

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(contest.title)}&details=${encodeURIComponent(contest.description)}&dates=${startTime}/${endTime}`;

    window.open(url, '_blank');
  };

  /**
   * Add multiple contests to Google Calendar
   * @param {Array} contests - Array of contest objects
   */
  const addMultipleContestsToCalendar = contests => {
    if (!contests || contests.length === 0) return;

    // For now, just add the first contest as Google Calendar doesn't support
    // adding multiple events at once through URL parameters
    addContestToCalendar(contests[0]);

    // In a real implementation, you might want to:
    // 1. Use Google Calendar API with OAuth
    // 2. Create an .ics file with multiple events
    // 3. Show a modal to let users select which contests to add
  };

  return {
    addContestToCalendar,
    addMultipleContestsToCalendar,
  };
}
