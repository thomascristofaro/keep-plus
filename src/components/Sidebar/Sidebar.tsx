import React from 'react';
import ThemeToggle from '../ThemeToggle/index.ts';
import { getAllTags } from '../../utils/helpers.ts';
import { tagColors } from '../../utils/constants.ts';
import type { Card } from '../../types/index.ts';

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  cards: Card[];
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  activeTag: string;
  setActiveTag: (tag: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * Sidebar component that displays navigation and tag filtering options
 */
const Sidebar: React.FC<SidebarProps> = ({ 
    cards, 
    isDark, 
    setIsDark, 
    activeTag, 
    setActiveTag, 
    searchTerm, 
    // setSearchTerm is passed but not used in this component
    setSearchTerm: _setSearchTerm,
    isOpen,
    setIsOpen 
}) => {
    const tags = getAllTags(cards, tagColors);
    const filteredCards = cards.filter(card => {
        const matchesSearch = !searchTerm || 
            card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (card.content && card.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
            card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesTag = !activeTag || card.tags.includes(activeTag);
        
        return matchesSearch && matchesTag;
    });

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
                    onClick={() => setIsOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:z-auto`}>
                <div className="p-4 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-linear-to-br from-keep-yellow to-keep-blue rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                            </div>
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Keep+ Wall
                            </h1>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Theme Toggle */}
                    <ThemeToggle isDark={isDark} setIsDark={setIsDark} />

                    {/* All Items */}
                    <div className="mb-6">
                        <button
                            onClick={() => setActiveTag('')}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                                !activeTag 
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m8 12H5" />
                                </svg>
                                <span className="font-medium">All Items</span>
                            </div>
                            <span className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {filteredCards.length}
                            </span>
                        </button>
                    </div>

                    {/* Tags Section */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                            Tags
                        </h3>
                        <div className="flex-1 space-y-1 overflow-y-auto">
                            {tags.map(tag => (
                                <button
                                    key={tag.name}
                                    onClick={() => setActiveTag(activeTag === tag.name ? '' : tag.name)}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                                        activeTag === tag.name
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: tag.color }}
                                        />
                                        <span className="text-sm truncate">{tag.name}</span>
                                    </div>
                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full ml-2">
                                        {tag.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;