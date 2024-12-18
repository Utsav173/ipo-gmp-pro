import { GmpDataItem, SortBy } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price string to INR
export const formatPrice = (price: string | null): string => {
  if (!price || price === "--") return "-";
  const numPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
  return isNaN(numPrice) ? "-" : priceFormatter.format(numPrice);
};

// Format IPO size (handles Cr/Crore suffix)
export const formatIPOSize = (size: string): string => {
  if (!size || size === "--") return "-";
  const decodedSize = decodeHTML(size);
  const numMatch = decodedSize.match(/[\d,]+\.?\d*/);
  if (!numMatch) return decodedSize;

  const numValue = parseFloat(numMatch[0].replace(/,/g, ""));
  return `${priceFormatter.format(numValue)} Cr`;
};

export const decodeHTML = (html: string) => {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = html;
  return tempElement.textContent || tempElement.innerText || "";
};

/**
 * Attempts to parse a given date string into a Date object.
 *
 * Recognized formats:
 *  - "DD-MMM" (e.g., "23-Dec")
 *  - "DD-MMM HH:mm" (e.g., "18-Dec 16:01")
 *
 * If the given string does not match any of these formats, null will be returned.
 * @param {string | null} dateStr
 * @returns {Date | null}
 */
export const parseDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;

  // Handle "DD-MMM" format (e.g., "23-Dec")
  if (dateStr.includes("-") && !dateStr.includes(":")) {
    const [day, month] = dateStr.split("-");
    const year = new Date().getFullYear();
    return new Date(`${month} ${day}, ${year}`);
  }

  // Handle "DD-MMM HH:mm" format (e.g., "18-Dec 16:01")
  if (dateStr.includes(":")) {
    const [datePart] = dateStr.split(" ");
    const [day, month] = datePart.split("-");
    const year = new Date().getFullYear();
    return new Date(`${month} ${day}, ${year}`);
  }

  return null;
};

/**
 * Format a Date object as a string in the format "DD-MMM YYYY" localized to the Asia/Kolkata timezone.
 * If the input date is null, return a hyphen.
 */
export const formatDate = (date: Date | null): string => {
  if (!date) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

// Indian Rupee formatter
export const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * Sorts an array of GMP data items by a given key.
 *
 * Handles different types of values:
 * - Numbers: Compares the numeric values directly.
 * - GMP: Handles the special case of GMP, which can be "-" or a number.
 * - Dates: Compares the dates by their timestamp.
 * - Strings: Compares the strings lexicographically.
 *
 * @param data The array of GMP data items to sort.
 * @param sortBy The key to sort by.
 * @param sortOrder The order to sort in: "asc" or "desc".
 * @returns The sorted array of GMP data items.
 */
export const sortData = (
  data: GmpDataItem[],
  sortBy: SortBy,
  sortOrder: "asc" | "desc"
): GmpDataItem[] => {
  return [...data].sort((a, b) => {
    let aVal = a[sortBy as keyof GmpDataItem] || "";
    let bVal = b[sortBy as keyof GmpDataItem] || "";

    // Handle numeric values
    if (sortBy === "price" || sortBy === "lot" || sortBy === "ipo_size") {
      const aNum = parseFloat(aVal.toString().replace(/[^0-9.-]+/g, "")) || 0;
      const bNum = parseFloat(bVal.toString().replace(/[^0-9.-]+/g, "")) || 0;
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    }

    // Handle GMP special case
    if (sortBy === "gmp") {
      aVal = aVal === "-" ? "0" : (aVal as string);
      bVal = bVal === "-" ? "0" : (bVal as string);
      const aNum = parseFloat(aVal) || 0;
      const bNum = parseFloat(bVal) || 0;
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    }

    // Handle dates
    if (
      ["open", "close", "boa_dt", "listing", "gmp_updated"].includes(sortBy)
    ) {
      const aDate = parseDate(aVal);
      const bDate = parseDate(bVal);

      if (!aDate && !bDate) return 0;
      if (!aDate) return sortOrder === "asc" ? 1 : -1;
      if (!bDate) return sortOrder === "asc" ? -1 : 1;

      return sortOrder === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // Default string comparison
    return sortOrder === "asc"
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());
  });
};
