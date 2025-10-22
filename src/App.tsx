import React, { useState, useEffect, useMemo } from 'react';
import Card from './components/Card/index.ts';
import Sidebar from './components/Sidebar/index.ts';
import AddCardModal from './components/AddCardModal/index.ts';
import { initialCards } from './data/initialData.ts';
import type { Card as CardType } from './types/index.ts';

/**
 * Main App component that manages state and renders the application
 */
const App: React.FC = () => {
    const [cards, setCards] = useState<CardType[]>(initialCards);
    const [isDark, setIsDark] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeTag, setActiveTag] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [singleColumn, setSingleColumn] = useState<boolean>(false);

    // Apply dark mode to document
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Filter cards based on search term and active tag
    const filteredCards = useMemo(() => {
        return cards.filter((card: CardType) => {
            const matchesSearch = !searchTerm || 
                card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesTag = !activeTag || card.tags.includes(activeTag);
            
            return matchesSearch && matchesTag;
        });
    }, [cards, searchTerm, activeTag]);

    // Add a new card to the list
    const handleAddCard = (newCard: CardType): void => {
        setCards((prev: CardType[]) => [newCard, ...prev]);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar 
                cards={cards}
                isDark={isDark}
                setIsDark={setIsDark}
                activeTag={activeTag}
                setActiveTag={setActiveTag}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search cards..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setSingleColumn(!singleColumn)}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible"
                                title={singleColumn ? 'Multi-column view' : 'Single column view'}
                            >
                                {singleColumn ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                    </svg>
                                )}
                            </button>
                            
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus-visible flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Card</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Cards Grid */}
                <main className="flex-1 overflow-y-auto p-6">
                    {filteredCards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <p className="text-lg font-medium mb-2">No cards found</p>
                            <p className="text-sm">
                                {searchTerm || activeTag 
                                    ? 'Try adjusting your search or filters'
                                    : 'Start by adding your first card'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className={`masonry-grid ${singleColumn ? 'single-column' : ''}`}>
                            {filteredCards.map((card: CardType) => (
                                <Card key={card.id} card={card} />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Add Card Modal */}
            <AddCardModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAddCard={handleAddCard}
            />
        </div>
    );
};

export default App;