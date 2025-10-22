/**
 * Helper utility functions for the Keep+ Wall application
 */

import type { Card, TagColors } from '../types';

/**
 * Tag data with count and color information
 */
export interface TagWithCount {
  name: string;
  count: number;
  color: string;
}

/**
 * Extracts the domain name from a URL
 * @param url - The URL to extract the domain from
 * @returns The domain name without 'www.' prefix
 */
export const getDomainFromUrl = (url: string): string => {
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
    } catch {
        return '';
    }
};

/**
 * Gets a favicon URL from Google's favicon service
 * @param url - The URL to get the favicon for
 * @returns The favicon URL or null if not available
 */
export const getFaviconUrl = (url: string): string | null => {
    const domain = getDomainFromUrl(url);
    return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;
};

/**
 * Extracts all unique tags from a list of cards with counts
 * @param cards - Array of card objects
 * @param tagColors - Object mapping tag names to colors
 * @returns Array of tag objects with name, count, and color properties
 */
export const getAllTags = (cards: Card[], tagColors: TagColors): TagWithCount[] => {
    const tagCounts: Record<string, number> = {};
    cards.forEach(card => {
        card.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    return Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count,
        color: tagColors[name]?.bg || '#6b7280'
    }));
};