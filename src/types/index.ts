/**
 * Type definitions for the Keep Plus application
 */

export interface Card {
  id: number; // Unique identifier
  title: string;
  coverUrl?: string; // Optional: URL or local path to cover image
  link?: string; // Optional: original link for cover/title
  content?: string; // Optional: Rich text or markdown
  tags: string[]; // Array of tag names
  createdAt: Date;
  updatedAt: Date;
}

export interface TagColor {
  bg: string;
  text: string;
}

export interface TagColors {
  [key: string]: TagColor;
}

export interface Tag {
  name: string;
  color: string;
  count?: number;
}

export interface FormErrors {
  [key: string]: string;
}