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
}

/**
 * Card component displays a single card with image/link content
 */
const Card: React.FC<CardProps> = ({ card }) => {
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [imageError, setImageError] = useState<boolean>(false);
    
    const handleCardClick = (): void => {
        window.open(card.url, '_blank', 'noopener,noreferrer');
    };

    const renderThumbnail = () => {
        if (card.type === 'image') {
            return (
                <div className="relative overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800 aspect-video">
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 loading-shimmer"></div>
                    )}
                    <img
                        src={card.url}
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
        } else {
            const faviconUrl = getFaviconUrl(card.url);
            return (
                <div className="flex items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
                    {faviconUrl && (
                        <img
                            src={faviconUrl}
                            alt="Site favicon"
                            className="w-8 h-8 mr-3 rounded"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    )}
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">
                            Link
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {getDomainFromUrl(card.url)}
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </div>
            );
        }
    };

    return (
        <div 
            className="masonry-item fade-in"
            onClick={handleCardClick}
        >
            <div className="card-hover bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden">
                {renderThumbnail()}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                        {card.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {card.tags.map((tagName) => {
                            const tag = { name: tagName, color: tagColors[tagName]?.bg || '#6b7280' };
                            return (
                                <TagBadge
                                    key={tagName}
                                    tag={tag}
                                    isActive={false}
                                    onClick={() => {
                                        // Prevent card click when tag is clicked
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;