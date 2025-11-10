import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from './components/Card/index.ts';
import Sidebar from './components/Sidebar/index.ts';
import AddCardModal from './components/AddCardModal/index.ts';
import { useCardStorage } from './hooks/useCardStorage.ts';
import type { Card as CardType } from './types/index.ts';
import { logger, trackAction } from './services/logger.ts';

/**
 * Main App component that manages state and renders the application
 */
const App: React.FC = () => {
    const navigate = useNavigate();
    const { tagName, noteId } = useParams<{ tagName?: string; noteId?: string }>();
    
    const {
        cards,
        loading: storageLoading,
        error: storageError,
        initialized,
        addCard,
        updateCard,
        deleteCard,
        clearError
    } = useCardStorage();
    
    const [isDark, setIsDark] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeTag, setActiveTag] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [wideCardMode, setWideCardMode] = useState<boolean>(false);

    // Handle URL routing - sync URL params with state
    useEffect(() => {
        // Handle tag routing
        if (tagName) {
            const decodedTag = decodeURIComponent(tagName);
            if (decodedTag !== activeTag) {
                logger.trackPageView(`/tag/${decodedTag}`);
                setActiveTag(decodedTag);
            }
        } else if (activeTag && !noteId) {
            // Clear active tag when navigating away
            setActiveTag('');
            logger.trackPageView('/');
        }

        // Handle note routing
        if (noteId) {
            const id = parseInt(noteId, 10);
            if (!isNaN(id) && cards.length > 0) {
                const card = cards.find(c => c.id === id);
                if (card) {
                    if (!editingCard || editingCard.id !== id) {
                        logger.trackPageView(`/note/${id}`);
                        setEditingCard(card);
                        setShowAddModal(true);
                    }
                } else {
                    // Note not found, redirect to home
                    logger.warn('Note not found, redirecting', { noteId: id }, 'App');
                    navigate(activeTag ? `/tag/${encodeURIComponent(activeTag)}` : '/');
                }
            }
        } else if (!noteId && (showAddModal || editingCard)) {
            // Close modal if URL doesn't have noteId anymore (but don't trigger if already closed)
            if (showAddModal || editingCard) {
                setShowAddModal(false);
                setEditingCard(null);
            }
        }
    }, [tagName, noteId, cards, activeTag, navigate]);

    // Apply dark mode to document
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Clear storage errors when they're displayed
    useEffect(() => {
        if (storageError) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [storageError, clearError]);

    // Filter cards based on search term and active tag
    const filteredCards = useMemo(() => {
        return cards.filter((card: CardType) => {
            const matchesSearch = !searchTerm || 
                card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (card.content && card.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                card.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesTag = !activeTag || card.tags.includes(activeTag);
            
            return matchesSearch && matchesTag;
        });
    }, [cards, searchTerm, activeTag]);

    // Add a new card to the storage
    const handleAddCard = async (newCard: CardType): Promise<void> => {
        await addCard(newCard);
    };

    // Update an existing card
    const handleUpdateCard = async (updatedCard: CardType): Promise<void> => {
        await updateCard(updatedCard.id, updatedCard);
    };

    // Open edit modal for a card
    const handleEditCard = (card: CardType): void => {
        navigate(`/note/${card.id}`);
    };

    // Toggle card selection
    const handleSelectCard = (cardId: number): void => {
        setSelectedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
            }
            return newSet;
        });
    };

    // Delete selected cards
    const handleDeleteSelected = async (): Promise<void> => {
        if (selectedCards.size === 0) return;
        
        const confirmed = window.confirm(`Are you sure you want to delete ${selectedCards.size} card(s)?`);
        if (!confirmed) return;

        trackAction('delete_multiple_cards', { count: selectedCards.size });
        
        for (const cardId of selectedCards) {
            await deleteCard(cardId);
        }
        setSelectedCards(new Set());
        setSelectionMode(false);
    };

    // Delete a single card from edit modal
    const handleDeleteCard = async (cardId: number): Promise<void> => {
        const confirmed = window.confirm('Are you sure you want to delete this card?');
        if (!confirmed) return;

        const success = await deleteCard(cardId);
        if (success) {
            setShowAddModal(false);
            setEditingCard(null);
            navigate('/');
        }
    };

    // Handle tag selection from sidebar
    const handleSetActiveTag = (tag: string): void => {
        setActiveTag(tag);
        if (tag) {
            navigate(`/tag/${encodeURIComponent(tag)}`);
        } else {
            navigate('/');
        }
    };

    // Handle modal close
    const handleCloseModal = (): void => {
        setShowAddModal(false);
        setEditingCard(null);
        // Navigate back to the previous view (either tag or home)
        if (activeTag) {
            navigate(`/tag/${encodeURIComponent(activeTag)}`);
        } else {
            navigate('/');
        }
    };

    // Show loading state while storage is initializing
    if (!initialized && storageLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Initializing storage...</p>
                </div>
            </div>
        );
    }

    // Show error state if storage failed to initialize
    if (!initialized && storageError) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Storage Error</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{storageError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Reload App
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar 
                cards={cards}
                isDark={isDark}
                setIsDark={setIsDark}
                activeTag={activeTag}
                setActiveTag={handleSetActiveTag}
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
                            {selectionMode && selectedCards.size > 0 && (
                                <button
                                    onClick={handleDeleteSelected}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus-visible flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete ({selectedCards.size})</span>
                                </button>
                            )}
                            
                            <button
                                onClick={() => setWideCardMode(!wideCardMode)}
                                className={`p-2 rounded-lg font-medium transition-colors focus-visible ${
                                    wideCardMode 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                title={wideCardMode ? 'Normal width' : 'Double width'}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                                </svg>
                            </button>
                            
                            <button
                                onClick={() => {
                                    setSelectionMode(!selectionMode);
                                    if (selectionMode) {
                                        setSelectedCards(new Set());
                                    }
                                }}
                                className={`p-2 rounded-lg font-medium transition-colors focus-visible ${
                                    selectionMode 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                title={selectionMode ? 'Cancel selection' : 'Select cards'}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </button>
                            
                            <button
                                onClick={() => {
                                    setEditingCard(null);
                                    setShowAddModal(true);
                                }}
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

                {/* Error Toast - Show runtime storage errors */}
                {initialized && storageError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mx-4 mt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700 dark:text-red-200 text-sm">{storageError}</p>
                            </div>
                            <button
                                onClick={clearError}
                                className="text-red-400 hover:text-red-600 dark:hover:text-red-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

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
                        <div className={`masonry-grid ${wideCardMode ? 'wide-card-mode' : ''}`}>
                            {filteredCards.map((card: CardType) => (
                                <Card 
                                    key={card.id} 
                                    card={card} 
                                    isSelected={selectedCards.has(card.id)}
                                    onSelect={selectionMode ? handleSelectCard : undefined}
                                    onEdit={handleEditCard}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Add/Edit Card Modal */}
            <AddCardModal
                isOpen={showAddModal}
                onClose={handleCloseModal}
                onSave={editingCard ? handleUpdateCard : handleAddCard}
                onDelete={editingCard ? handleDeleteCard : undefined}
                editingCard={editingCard}
            />
        </div>
    );
};

export default App;