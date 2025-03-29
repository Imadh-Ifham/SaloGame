import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Converts a date to UTC format.
 * @param date - The date to be converted.
 * @returns The date in UTC format.
 */
export const toUTC = (date: string | Date): string => {
  return dayjs(date).utc().format();
};

/**
 * Converts a UTC date to the user's local timezone.
 * @param utcDate - The UTC date to be converted.
 * @param timezone - The user's timezone.
 * @returns The date in the user's local timezone.
 */
export const fromUTC = (utcDate: string, userTimezone: string): string => {
  return dayjs(utcDate).tz(userTimezone).format();
};

/**
 * Converts a date to the user's local timezone.
 * @param date - The date to be converted.
 * @param timezone - The user's timezone.
 * @returns The date in the user's local timezone.
 */
export const toLocal = (date: string | Date, userTimezone: string): string => {
  return dayjs(date).tz(userTimezone).format();
};

/**
 * Gets the current date and time in UTC format.
 * @returns The current date and time in UTC format.
 */
export const getCurrentUTC = (): string => {
  return dayjs().utc().format();
};

/**
 * Gets the current date and time in the user's local timezone.
 * @param timezone - The user's timezone.
 * @returns The current date and time in the user's local timezone.
 */
export const getCurrentLocal = (userTimezone: string): string => {
  return dayjs().tz(userTimezone).format();
};

/**
 * Calculates the end time based on the start time and duration.
 * @param startTime - The start time in UTC.
 * @param duration - The duration in minutes.
 * @returns The calculated end time in UTC.
 */
export const calculateEndTime = (
  startTime: string,
  duration: number
): string => {
  return dayjs(startTime).add(duration, "minute").utc().format();
};

export const formatTo12Hour = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Hour '0' should be '12'

  // Format minutes to always have two digits
  const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;

  // Return the formatted string
  return `${hours}:${minutesFormatted} ${ampm}`;
};
