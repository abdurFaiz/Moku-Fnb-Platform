export class FormatUtils {
  /**
   * Format currency to Indonesian Rupiah format
   */
  static formatCurrency(amount: number): string {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }

  /**
   * Format date to Indonesian format
   */
  static formatDate(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Format phone number to Indonesian format
   */
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("62")) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith("0")) {
      return `+62${cleaned.slice(1)}`;
    }
    return `+62${cleaned}`;
  }

  /**
   * Format product name for display
   */
  static formatProductName(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * Truncate text with ellipsis
   */
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }
}

export class DateFormatterUtils {
  /**
   * Parse date from multiple formats (DD/MM/YYYY, ISO 8601, etc.)
   * @param dateString - Date string in various formats
   * @returns Parsed Date object
   */
  private static parseDate(dateString: string): Date {
    if (!dateString) {
      throw new Error("Date string is empty");
    }

    // Try to parse DD/MM/YYYY format first (07/11/2025)
    const ddmmyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (ddmmyyyyRegex.exec(dateString)) {
      const [day, month, year] = dateString.split("/");
      return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));
    }

    // Try ISO 8601 format (2025-11-02T08:34:08.000000Z)
    if (dateString.includes("T")) {
      return new Date(dateString);
    }

    // Fallback to default Date constructor
    return new Date(dateString);
  }

  /**
   * Check if date is valid
   * @param date - Date object to validate
   * @returns true if date is valid
   */
  private static isValidDate(date: Date): boolean {
    return !Number.isNaN(date.getTime());
  }

  /**
   * Format date for transaction header: "Jumat, 7 Nov 2025, 08:34"
   * @param dateString - Date string in any supported format
   * @returns Formatted date string in Indonesian
   */
  static formatTransactionDate(dateString: string | Date): string {
    try {
      const dateObj = typeof dateString === "string" ? this.parseDate(dateString) : dateString;

      if (!this.isValidDate(dateObj)) {
        return typeof dateString === "string" ? dateString : "Invalid date";
      }

      const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString("id-ID", { month: "short" });
      const year = dateObj.getFullYear();
      const time = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

      return `${dayName}, ${day} ${month} ${year}, ${time}`;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error formatting transaction date:", error);
      return typeof dateString === "string" ? dateString : "Invalid date";
    }
  }

  /**
   * Format date in Indonesian locale: "Jumat, 7 November 2025"
   * @param dateString - Date string in any supported format
   * @returns Formatted date string
   */
  static formatDateIndonesian(dateString: string | Date): string {
    try {
      const dateObj = typeof dateString === "string" ? this.parseDate(dateString) : dateString;

      if (!this.isValidDate(dateObj)) {
        return typeof dateString === "string" ? dateString : "Invalid date";
      }

      return dateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error formatting date in Indonesian:", error);
      return typeof dateString === "string" ? dateString : "Invalid date";
    }
  }

  /**
   * Format date and time in Indonesian: "7 Nov 2025, 08:34"
   * @param dateString - Date string in any supported format
   * @returns Formatted date with time
   */
  static formatDateTimeIndonesian(dateString: string | Date): string {
    try {
      const dateObj = typeof dateString === "string" ? this.parseDate(dateString) : dateString;

      if (!this.isValidDate(dateObj)) {
        return typeof dateString === "string" ? dateString : "Invalid date";
      }

      const date = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const time = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

      return `${date}, ${time}`;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error formatting date and time:", error);
      return typeof dateString === "string" ? dateString : "Invalid date";
    }
  }

  /**
   * Format only time: "08:34"
   * @param dateString - Date string in any supported format
   * @returns Formatted time
   */
  static formatTime(dateString: string | Date): string {
    try {
      const dateObj = typeof dateString === "string" ? this.parseDate(dateString) : dateString;

      if (!this.isValidDate(dateObj)) {
        return "Invalid time";
      }

      return dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  }

  /**
   * Format only date: "7 Nov 2025"
   * @param dateString - Date string in any supported format
   * @returns Formatted date only
   */
  static formatDateOnly(dateString: string | Date): string {
    try {
      const dateObj = typeof dateString === "string" ? this.parseDate(dateString) : dateString;

      if (!this.isValidDate(dateObj)) {
        return typeof dateString === "string" ? dateString : "Invalid date";
      }

      return dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error formatting date only:", error);
      return typeof dateString === "string" ? dateString : "Invalid date";
    }
  }
}

