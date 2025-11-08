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
    const [tagInput, setTagInput] = useState('');
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
        setTagInput('');
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

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

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
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Enter card title *"
                                required
                            />
                        </div>

                        {/* Cover URL */}
                        <div>
                            <input
                                type="url"
                                value={coverUrl}
                                onChange={(e) => setCoverUrl(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Cover image URL (https://example.com/image.jpg)"
                            />
                            {coverUrl && (
                                <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <img 
                                        src={coverUrl} 
                                        alt="Cover preview" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Content */}
                        <div>
                            <MarkdownEditor
                                value={content}
                                onChange={(value) => setContent(value)}
                                placeholder="Add content here... (supports Markdown)"
                            />
                        </div>

                        {/* Link */}
                        <div>
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Link URL (https://example.com)"
                            />
                        </div>
                        
                        {/* Tags */}
                        <div>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Type a tag and press Enter"
                            />
                            
                            {/* Tag list */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center">
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