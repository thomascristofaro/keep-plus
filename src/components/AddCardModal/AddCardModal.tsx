import React, { useState, useEffect, useRef } from 'react';
import MarkdownEditor from '../MarkdownEditor/index.ts';
import type { Card } from '../../types/index.ts';

/**
 * Props for the AddCardModal component
 */
export interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Card) => void;
  onDelete?: (cardId: number) => void;
  editingCard?: Card | null;
}

/**
 * Modal component for adding or editing a card
 */
const AddCardModal: React.FC<AddCardModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  editingCard 
}) => {
    const [title, setTitle] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [link, setLink] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const modalRef = useRef<HTMLDivElement>(null);

    // Load card data when editing
    useEffect(() => {
        if (editingCard) {
            setTitle(editingCard.title);
            setCoverUrl(editingCard.coverUrl || '');
            setLink(editingCard.link || '');
            setContent(editingCard.content || '');
            setTags(editingCard.tags);
        } else {
            // Reset form when adding new card
            setTitle('');
            setCoverUrl('');
            setLink('');
            setContent('');
            setTags([]);
        }
    }, [editingCard, isOpen]);

    // Auto-save when any field changes
    useEffect(() => {
        if (!isOpen || !title.trim()) return;

        const timeoutId = setTimeout(() => {
            const card: Card = {
                id: editingCard?.id || Date.now(),
                title: title.trim(),
                coverUrl: coverUrl.trim() || undefined,
                link: link.trim() || undefined,
                content: content.trim() || undefined,
                tags: tags,
                createdAt: editingCard?.createdAt || new Date(),
                updatedAt: new Date()
            };

            onSave(card);
        }, 500); // Debounce by 500ms

        return () => clearTimeout(timeoutId);
    }, [title, coverUrl, link, content, tags, editingCard, onSave, isOpen]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleRemoveTag = (tagToRemove: string): void => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleDelete = (): void => {
        if (editingCard && onDelete) {
            onDelete(editingCard.id);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
                {/* Cover URL with Title Overlay */}
                <div className="relative shrink-0">
                    {coverUrl ? (
                        <div className="relative w-full h-64 rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
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
                                    onChange={(e) => setTitle(e.target.value)}
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
                                        setCoverUrl(newUrl);
                                    }
                                }}
                                className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700"
                                title="Change cover URL"
                            >
                                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="relative w-full h-64 rounded-t-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={() => {
                                    const newUrl = prompt('Enter cover image URL:');
                                    if (newUrl && newUrl.trim()) {
                                        setCoverUrl(newUrl.trim());
                                    }
                                }}
                                className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium">Add Cover Image</span>
                            </button>
                            {/* Title Input when no cover */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-100 dark:bg-gray-800">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 text-3xl font-bold border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Enter card title *"
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto min-h-0 p-6">
                    <div className="min-h-[200px]">
                        <MarkdownEditor
                            value={content}
                            onChange={(value) => setContent(value)}
                            placeholder="Add content here... (supports Markdown)"
                        />
                    </div>
                </div>

                {/* Fixed Footer with Link and Tags */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 space-y-3">
                    {/* Link Input */}
                    <div>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
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
                                if (newTag && newTag.trim() && !tags.includes(newTag.trim())) {
                                    setTags([...tags, newTag.trim()]);
                                }
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