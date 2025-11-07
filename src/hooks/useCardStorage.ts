import { useState, useEffect, useCallback } from 'react';
import type { Card } from '../types/index.ts';
import { cardStorage } from '../services/storage-factory.ts';
import { initialCards } from '../data/initialData.ts';

/**
 * Custom hook for managing card data with storage abstraction
 */
export function useCardStorage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState<boolean>(false);

    // Initialize storage and load cards
    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            setError(null);

            try {
                // Initialize the storage
                const initResult = await cardStorage.initialize();
                if (!initResult.success) {
                    throw new Error(initResult.error || 'Failed to initialize storage');
                }

                // Load existing cards
                const result = await cardStorage.getCards({
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                });

                if (result.success && result.data) {
                    // If no cards exist, populate with initial data
                    if (result.data.length === 0) {
                        console.log('No cards found, loading initial data...');
                        
                        // Convert initial cards to the format expected by storage
                        const cardsToImport = initialCards.map(card => ({
                            ...card,
                            // Keep the original IDs from initial data for consistency
                        }));
                        
                        const importResult = await cardStorage.importData(cardsToImport);
                        if (importResult.success) {
                            // Reload cards after import
                            const reloadResult = await cardStorage.getCards({
                                sortBy: 'createdAt',
                                sortOrder: 'desc'
                            });
                            if (reloadResult.success && reloadResult.data) {
                                setCards(reloadResult.data);
                            } else {
                                setCards(initialCards);
                            }
                        } else {
                            // Fallback to initial data in state if import fails
                            setCards(initialCards);
                        }
                    } else {
                        setCards(result.data);
                    }
                } else {
                    throw new Error(result.error || 'Failed to load cards');
                }

                setInitialized(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                console.error('Storage initialization error:', err);
                // Fallback to initial data if storage completely fails
                setCards(initialCards);
                setInitialized(true);
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    /**
     * Add a new card
     */
    const addCard = useCallback(async (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
        setError(null);

        try {
            const result = await cardStorage.createCard(cardData);
            
            if (result.success && result.data) {
                setCards(prev => [result.data!, ...prev]);
                return true;
            } else {
                setError(result.error || 'Failed to create card');
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create card';
            setError(errorMessage);
            console.error('Error creating card:', err);
            return false;
        }
    }, []);

    /**
     * Update an existing card
     */
    const updateCard = useCallback(async (id: number, updates: Partial<Card>): Promise<boolean> => {
        setError(null);

        try {
            const result = await cardStorage.updateCard(id, updates);
            
            if (result.success && result.data) {
                setCards(prev => prev.map(card => 
                    card.id === id ? result.data! : card
                ));
                return true;
            } else {
                setError(result.error || 'Failed to update card');
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update card';
            setError(errorMessage);
            console.error('Error updating card:', err);
            return false;
        }
    }, []);

    /**
     * Delete a card
     */
    const deleteCard = useCallback(async (id: number): Promise<boolean> => {
        setError(null);

        try {
            const result = await cardStorage.deleteCard(id);
            
            if (result.success) {
                setCards(prev => prev.filter(card => card.id !== id));
                return true;
            } else {
                setError(result.error || 'Failed to delete card');
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete card';
            setError(errorMessage);
            console.error('Error deleting card:', err);
            return false;
        }
    }, []);

    /**
     * Search cards
     */
    const searchCards = useCallback(async (query: string): Promise<Card[]> => {
        try {
            const result = await cardStorage.searchCards(query);
            return result.success && result.data ? result.data : [];
        } catch (err) {
            console.error('Error searching cards:', err);
            return [];
        }
    }, []);

    /**
     * Get cards by tag
     */
    const getCardsByTag = useCallback(async (tag: string): Promise<Card[]> => {
        try {
            const result = await cardStorage.getCardsByTag(tag);
            return result.success && result.data ? result.data : [];
        } catch (err) {
            console.error('Error getting cards by tag:', err);
            return [];
        }
    }, []);

    /**
     * Get all unique tags
     */
    const getAllTags = useCallback(async (): Promise<string[]> => {
        try {
            const result = await cardStorage.getAllTags();
            return result.success && result.data ? result.data : [];
        } catch (err) {
            console.error('Error getting tags:', err);
            return [];
        }
    }, []);

    /**
     * Export all cards
     */
    const exportCards = useCallback(async (): Promise<Card[] | null> => {
        try {
            const result = await cardStorage.exportData();
            return result.success && result.data ? result.data : null;
        } catch (err) {
            console.error('Error exporting cards:', err);
            return null;
        }
    }, []);

    /**
     * Import cards (replaces all existing cards)
     */
    const importCards = useCallback(async (cardsToImport: Card[]): Promise<boolean> => {
        setError(null);
        setLoading(true);

        try {
            const result = await cardStorage.importData(cardsToImport);
            
            if (result.success) {
                // Reload cards after import
                const reloadResult = await cardStorage.getCards({
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                });
                
                if (reloadResult.success && reloadResult.data) {
                    setCards(reloadResult.data);
                    return true;
                } else {
                    throw new Error('Failed to reload cards after import');
                }
            } else {
                setError(result.error || 'Failed to import cards');
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to import cards';
            setError(errorMessage);
            console.error('Error importing cards:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Clear all cards
     */
    const clearAllCards = useCallback(async (): Promise<boolean> => {
        setError(null);

        try {
            const result = await cardStorage.clearAll();
            
            if (result.success) {
                setCards([]);
                return true;
            } else {
                setError(result.error || 'Failed to clear cards');
                return false;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to clear cards';
            setError(errorMessage);
            console.error('Error clearing cards:', err);
            return false;
        }
    }, []);

    /**
     * Refresh cards from storage
     */
    const refreshCards = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const result = await cardStorage.getCards({
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            if (result.success && result.data) {
                setCards(result.data);
            } else {
                throw new Error(result.error || 'Failed to refresh cards');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh cards';
            setError(errorMessage);
            console.error('Error refreshing cards:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        // State
        cards,
        loading,
        error,
        initialized,
        
        // Actions
        addCard,
        updateCard,
        deleteCard,
        searchCards,
        getCardsByTag,
        getAllTags,
        exportCards,
        importCards,
        clearAllCards,
        refreshCards,
        
        // Utility
        clearError: () => setError(null)
    };
}