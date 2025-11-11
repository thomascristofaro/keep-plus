import React, { useState, useEffect, useRef } from 'react';
import type { Card } from '../../types/index.ts';
import { isInstagramUrl, fetchInstagramImageUrl } from '../../utils/instagram.ts';
import { logger, trackAction } from '../../services/logger.ts';

/**
 * Props for the AddCardModal component
 */
export interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (card: Partial<Card>) => Promise<Card | null>;
    onDelete?: (cardId: number) => void;
    editingCard?: Card | null;
    sharedData?: { title?: string; text?: string; url?: string } | null;
}

/**
 * Modal component for adding or editing a card
 */
const AddCardModal: React.FC<AddCardModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  editingCard,
  sharedData
}) => {
    const [title, setTitle] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [link, setLink] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [dbId, setDbId] = useState<number | null>(null); // Track DB id after first save
    const [createdAt, setCreatedAt] = useState<Date | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Load card data when editing
    useEffect(() => {
        // Only load data when modal is opening
        if (!isOpen) return;
        
        if (editingCard) {
            logger.info('Loading card for editing', { cardId: editingCard.id }, 'AddCardModal');
            setTitle(editingCard.title);
            setCoverUrl(editingCard.coverUrl || '');
            setLink(editingCard.link || '');
            setContent(editingCard.content || '');
            setTags(editingCard.tags);
            setDbId(editingCard.id);
            setCreatedAt(editingCard.createdAt);
        } else if (sharedData) {
            // Load shared data from external app
            logger.info('Loading shared data', sharedData, 'AddCardModal');
            setTitle(sharedData.title || '');
            setLink(sharedData.url || '');
            setContent(sharedData.text || '');
            setTags([]);
            setDbId(null);
            setCreatedAt(null);
        } else {
            // Reset form when adding new card
            logger.info('Opening modal for new card', undefined, 'AddCardModal');
            setTitle('');
            setCoverUrl('');
            setLink('');
            setContent('');
            setTags([]);
            setDbId(null);
            setCreatedAt(null);
        }
    }, [editingCard, sharedData, isOpen]);

    // Auto-fetch Instagram image when Instagram link is detected
    useEffect(() => {
        const fetchInstagramImage = async () => {
            if (link && isInstagramUrl(link)) {
                try {
                    logger.info('Fetching Instagram image', { link }, 'AddCardModal');
                    const imageUrl = await fetchInstagramImageUrl(link);
                    if (imageUrl) {
                        setCoverUrl(imageUrl);
                        logger.info('Instagram image fetched successfully', { imageUrl }, 'AddCardModal');
                    } else {
                        logger.warn('No Instagram image URL returned', { link }, 'AddCardModal');
                    }
                } catch (error) {
                    logger.error('Failed to fetch Instagram image', error, 'AddCardModal');
                }
            }
        };

        fetchInstagramImage();
    }, [link, coverUrl]);

    // Auto-save handler - only called after user actions
    const handleAutoSave = async () => {
        if (!isOpen || !title.trim()) return;

        if (dbId == null) {
            // First save: create card (no id, no createdAt)
            const cardToCreate = {
                title: title.trim(),
                coverUrl: coverUrl.trim() || undefined,
                link: link.trim() || undefined,
                content: content.trim() || undefined,
                tags: tags
            };
            logger.debug('Auto-saving new card (create)', { title: cardToCreate.title }, 'AddCardModal');
            const saved = await onSave(cardToCreate);
            if (saved && typeof saved === 'object' && 'id' in saved && saved.id) {
                setDbId(saved.id);
                setCreatedAt(saved.createdAt ? new Date(saved.createdAt) : new Date());
            }
        } else {
            // Update existing card
            const cardToUpdate = {
                id: dbId,
                title: title.trim(),
                coverUrl: coverUrl.trim() || undefined,
                link: link.trim() || undefined,
                content: content.trim() || undefined,
                tags: tags,
                createdAt: createdAt || new Date(),
                updatedAt: new Date()
            };
            logger.debug('Auto-saving card (update)', { cardId: dbId, title: cardToUpdate.title }, 'AddCardModal');
            await onSave(cardToUpdate);
        }
    };

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                // Use setTimeout to ensure we don't interfere with other click handlers
                setTimeout(() => {
                    onClose();
                }, 0);
            }
        };

        if (isOpen) {
            // Add a small delay before attaching the listener to prevent immediate close
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, onClose]);

    const handleRemoveTag = (tagToRemove: string): void => {
        trackAction('remove_tag', { tag: tagToRemove });
        setTags(tags.filter(tag => tag !== tagToRemove));
        // Trigger autosave after tag removal
        setTimeout(handleAutoSave, 0);
    };

    const handleAddTag = (newTag: string): void => {
        if (newTag && newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            // Trigger autosave after tag addition
            setTimeout(handleAutoSave, 0);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setTitle(e.target.value);
    };

    const handleTitleBlur = (): void => {
        setTimeout(handleAutoSave, 0);
    };

    const handleCoverUrlChange = (newUrl: string): void => {
        setCoverUrl(newUrl);
        if (!title.trim()) return;
        setTimeout(handleAutoSave, 0);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setContent(e.target.value);
    };

    const handleContentBlur = (): void => {
        setTimeout(handleAutoSave, 0);
    };

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setLink(e.target.value);
    };

    const handleLinkBlur = (): void => {
        setTimeout(handleAutoSave, 0);
    };

    const handleDelete = (): void => {
        if (editingCard && onDelete) {
            trackAction('delete_card', { cardId: editingCard.id });
            onDelete(editingCard.id);
        }
    };

    // Calculate cover height based on content length
    const getCoverHeight = (): string => {
        const contentLength = content.length;
        if (contentLength < 100) return 'h-[32rem]'; // ~512px - very short content
        if (contentLength < 300) return 'h-96'; // ~384px - short content
        if (contentLength < 600) return 'h-72'; // ~320px - medium content
        return 'h-64'; // ~288px - long content
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
                {/* Cover URL with Title Overlay */}
                <div className="relative shrink-0">
                    {coverUrl ? (
                        <div className={`relative w-full ${getCoverHeight()} rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group transition-all duration-300`}>
                            <img 
                                src={coverUrl} 
                                alt="Cover preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                            {/* Title Overlay - Bottom Left */}
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 via-black/50 to-transparent p-6 pt-20">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    onBlur={handleTitleBlur}
                                    className="w-full px-3 py-2 text-3xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-white/50 bg-transparent text-white placeholder-white/70 rounded"
                                    placeholder="Enter card title *"
                                    required
                                />
                            </div>
                            {/* Edit Cover Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    const newUrl = prompt('Enter cover image URL:', coverUrl);
                                    if (newUrl !== null) {
                                        handleCoverUrlChange(newUrl);
                                    }
                                }}
                                className="absolute top-4 right-16 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700"
                                title="Change cover URL"
                            >
                                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            {/* Remove Cover Button */}
                            <button
                                type="button"
                                onClick={() => handleCoverUrlChange('')}
                                className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                title="Remove cover image"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className={`relative w-full h-42 rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group transition-all duration-300`}>
                            <div className="w-full h-42 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-medium">Add Cover Image</span>
                            </div>
                            {/* Add Cover Button - Top Right */}
                            <button
                                type="button"
                                onClick={() => {
                                    const newUrl = prompt('Enter cover image URL:');
                                    if (newUrl && newUrl.trim()) {
                                        handleCoverUrlChange(newUrl.trim());
                                    }
                                }}
                                className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                                title="Add cover image"
                            >
                                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            {/* Title Overlay - Bottom Left */}
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 via-black/50 to-transparent p-6 pt-20 pointer-events-none">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    onBlur={handleTitleBlur}
                                    className="w-full px-3 py-2 text-3xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-white/50 bg-transparent text-white placeholder-white/70 rounded pointer-events-auto"
                                    placeholder="Enter card title *"
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-4">
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        onBlur={handleContentBlur}
                        placeholder="Add content here..."
                        className="w-full h-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                    />
                </div>

                {/* Fixed Footer with Link and Tags */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 space-y-3 rounded-b-lg">
                    {/* Link Input */}
                    <div>
                        <input
                            type="url"
                            value={link}
                            onChange={handleLinkChange}
                            onBlur={handleLinkBlur}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="https://example.com"
                        />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            >
                                {tag}
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                        
                        {/* Plus button to add tag */}
                        <button
                            type="button"
                            onClick={() => {
                                const newTag = prompt('Enter tag name:');
                                handleAddTag(newTag || '');
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Add tag"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-2">
                        {editingCard && onDelete ? (
                            <button
                                onClick={handleDelete}
                                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete card"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        ) : (
                            <div></div>
                        )}
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCardModal;