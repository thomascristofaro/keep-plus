import React from 'react';
import type { Tag } from '../../types/index.ts';

/**
 * Props for the TagBadge component
 */
export interface TagBadgeProps {
  tag: Tag;
  isActive: boolean;
  onClick: (tagName: string) => void;
  showCount?: boolean;
}

/**
 * TagBadge component displays a colored tag badge with optional count
 */
const TagBadge: React.FC<TagBadgeProps> = ({ tag, isActive, onClick, showCount = false }) => {
    return (
        <span 
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                isActive 
                    ? 'ring-2 ring-blue-500 ring-opacity-50' 
                    : 'hover:ring-1 hover:ring-gray-400'
            }`}
            style={{ 
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`
            }}
            onClick={() => onClick(tag.name)}
        >
            <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: tag.color }}></span>
            {tag.name}
            {showCount && <span className="ml-1 text-xs opacity-75">({tag.count})</span>}
        </span>
    );
};

export default TagBadge;