/**
 * Type definitions for the Keep Plus application
 */

export interface Card {
  id: number;
  title: string;
  description: string;
  url: string;
  type: 'link' | 'image';
  tags: string[];
  created_at: string;
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

export interface CardFormData {
  title: string;
  description: string;
  url: string;
  type: 'link' | 'image';
  tags: string;
}

export interface FormErrors {
  [key: string]: string;
}