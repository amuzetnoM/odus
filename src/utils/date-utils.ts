/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Validates if a date string is valid and in YYYY-MM-DD format
 */
export function isValidDate(dateStr: string | undefined): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && !!dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
}

/**
 * Normalizes a date to YYYY-MM-DD format
 */
export function normalizeDate(dateStr: string | undefined): string | undefined {
    if (!dateStr) return undefined;
    
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return undefined;
        
        // Return in YYYY-MM-DD format
        return date.toISOString().split('T')[0];
    } catch {
        return undefined;
    }
}

/**
 * Milliseconds in a day constant
 */
export const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
    return Math.ceil((date2.getTime() - date1.getTime()) / MS_PER_DAY);
}
