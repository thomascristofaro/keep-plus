import React, { useState } from 'react';
import TagBadge from '../TagBadge/index.ts';
import { getDomainFromUrl, getFaviconUrl } from '../../utils/helpers.ts';
import { tagColors } from '../../utils/constants.ts';
import type { Card as CardType } from '../../types/index.ts';

/**
 * Props for the Card component
 */
export interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  onEdit: (card: CardType) => void;
}

/**
 * Card component displays a single card with square cover, title, link logo, and tags
 */
const Card: React.FC<CardProps> = ({ card, isSelected = false, onSelect, onEdit }) => {
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [imageError, setImageError] = useState<boolean>(false);
    
    const handleCardClick = (e: React.MouseEvent): void => {
        // Check if click is on link logo or checkbox
        const target = e.target as HTMLElement;
        if (target.closest('.link-logo') || target.closest('.checkbox-container')) {
            return;
        }
        onEdit(card);
    };

    const handleLinkClick = (e: React.MouseEvent): void => {
        e.stopPropagation();
        if (card.link) {
            window.open(card.link, '_blank', 'noopener,noreferrer');
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.stopPropagation();
        if (onSelect) {
            onSelect(card.id);
        }
    };

    const renderCover = () => {
        if (card.coverUrl) {
            return (
                <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square">
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,#f0f0f0_0px,#e0e0e0_40px,#f0f0f0_80px)] dark:bg-[linear-gradient(90deg,#2d3748_0px,#4a5568_40px,#2d3748_80px)] bg-size-[200px] animate-shimmer"></div>
                    )}
                    <img
                        src={card.coverUrl}
                        alt={card.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                    {imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div 
            className="inline-block w-full mb-4 break-inside-avoid animate-fadeIn"
            onClick={handleCardClick}
        >
            <div className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden relative">
                {/* Checkbox for multi-select */}
                {onSelect && (
                    <div className="checkbox-container absolute top-2 left-2 z-10">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={handleCheckboxChange}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
                
                {/* Cover Image */}
                {renderCover()}
                
                <div className="p-4">
                    {/* Title */}
                    {card.title && card.title.trim() !== '' && (
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {card.title}
                        </h3>
                    )}

                    {/* Content Preview if no cover/title */}
                    {!card.coverUrl && (!card.title || card.title.trim() === '') && card.content && (
                        <div className="mb-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">{card.content.slice(0, 50)}</span>
                        </div>
                    )}
                    
                    {/* Link Logo */}
                    {card.link && (
                        <div className="mb-2">
                            <button
                                onClick={handleLinkClick}
                                className="link-logo inline-flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="Open link"
                            >
                                {getFaviconUrl(card.link) && (
                                    <img
                                        src={getFaviconUrl(card.link) || undefined}
                                        alt="Link"
                                        className="w-4 h-4 mr-1"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                )}
                                <span className="truncate max-w-[150px]">{getDomainFromUrl(card.link)}</span>
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </button>
                        </div>
                    )}
                    
                    {/* Tags */}
                    {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {card.tags.map((tagName) => {
                                const tag = { name: tagName, color: tagColors[tagName]?.bg || '#6b7280' };
                                return (
                                    <TagBadge
                                        key={tagName}
                                        tag={tag}
                                        isActive={false}
                                        onClick={() => {
                                            // Do nothing - prevent card click
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Card;