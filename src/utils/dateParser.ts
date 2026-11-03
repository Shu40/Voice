/**
 * Date Parser & Formatter Utility for YaadBuddy AI
 * Supports natural language relative date resolution (today, yesterday, last Monday, November 3, etc.)
 */

// We can anchor default reference date to system date or Nov 3, 2026 for consistent demo testing
export function getReferenceDate(): Date {
  // Use current local date
  return new Date();
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns human friendly date string e.g., "Today, Nov 3", "Yesterday, Nov 2", or "Saturday, Oct 28, 2026"
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetZero = new Date(target);
    targetZero.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - targetZero.getTime()) / (1000 * 60 * 60 * 24));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (diffDays === 0) {
      return `Today (${monthNames[m - 1]} ${d})`;
    } else if (diffDays === 1) {
      return `Yesterday (${monthNames[m - 1]} ${d})`;
    } else if (diffDays === -1) {
      return `Tomorrow (${monthNames[m - 1]} ${d})`;
    }

    return `${dayNames[target.getDay()]}, ${monthNames[m - 1]} ${d}, ${y}`;
  } catch {
    return dateStr;
  }
}

/**
 * Resolves natural language date mentions from user's sentence into an ISO YYYY-MM-DD string
 * If no date mentioned, defaults to today.
 */
export function parseNaturalDate(text: string, baseDate: Date = getReferenceDate()): { date: string; hasExplicitDate: boolean } {
  const lower = text.toLowerCase().trim();
  const today = new Date(baseDate);
  const currentYear = today.getFullYear();

  // 1. Check "yesterday" / "kal" (in past context)
  if (/\b(yesterday|kal)\b/i.test(lower) && !/\b(tomorrow)\b/i.test(lower)) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return { date: formatDateISO(yesterday), hasExplicitDate: true };
  }

  // 2. Check "tomorrow"
  if (/\b(tomorrow)\b/i.test(lower)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return { date: formatDateISO(tomorrow), hasExplicitDate: true };
  }

  // 3. Check "today" / "aaj" / "this morning" / "tonight"
  if (/\b(today|aaj|this morning|tonight|this afternoon|this evening)\b/i.test(lower)) {
    return { date: formatDateISO(today), hasExplicitDate: true };
  }

  // 4. Check "last [day of week]" e.g. "last monday", "last sunday"
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const lastDayMatch = lower.match(/\blast\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i);
  if (lastDayMatch) {
    const targetDayIndex = daysOfWeek.indexOf(lastDayMatch[1].toLowerCase());
    const currentDayIndex = today.getDay();
    let daysToSubtract = (currentDayIndex - targetDayIndex + 7) % 7;
    if (daysToSubtract === 0) daysToSubtract = 7; // strictly last week
    const resultDate = new Date(today);
    resultDate.setDate(today.getDate() - daysToSubtract);
    return { date: formatDateISO(resultDate), hasExplicitDate: true };
  }

  // 5. Check named months with day numbers: "November 3", "Nov 3", "3rd November", "15 November", "Oct 28"
  const monthMap: Record<string, number> = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11
  };

  const monthRegexPattern = Object.keys(monthMap).join('|');

  // Format: "November 3", "Nov 15th", "November 03 2026"
  const monthFirstRegex = new RegExp(`\\b(${monthRegexPattern})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(\\d{4}))?\\b`, 'i');
  const match1 = lower.match(monthFirstRegex);
  if (match1) {
    const mStr = match1[1].toLowerCase();
    const day = parseInt(match1[2], 10);
    const yr = match1[3] ? parseInt(match1[3], 10) : currentYear;
    const mIndex = monthMap[mStr];
    const d = new Date(yr, mIndex, day);
    return { date: formatDateISO(d), hasExplicitDate: true };
  }

  // Format: "3rd November", "15 Nov", "28th of October"
  const dayFirstRegex = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+of)?\\s+(${monthRegexPattern})(?:\\s+(\\d{4}))?\\b`, 'i');
  const match2 = lower.match(dayFirstRegex);
  if (match2) {
    const day = parseInt(match2[1], 10);
    const mStr = match2[2].toLowerCase();
    const yr = match2[3] ? parseInt(match2[3], 10) : currentYear;
    const mIndex = monthMap[mStr];
    const d = new Date(yr, mIndex, day);
    return { date: formatDateISO(d), hasExplicitDate: true };
  }

  // 6. Direct YYYY-MM-DD
  const isoMatch = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    return { date: isoMatch[0], hasExplicitDate: true };
  }

  // Default to today
  return { date: formatDateISO(today), hasExplicitDate: false };
}

/**
 * Returns start and end dates of the current week (Monday to Sunday)
 */
export function getCurrentWeekRange(baseDate: Date = getReferenceDate()): { start: string; end: string } {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: formatDateISO(monday),
    end: formatDateISO(sunday)
  };
}
