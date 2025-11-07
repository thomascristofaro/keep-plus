import React, { useState, useEffect } from 'react';
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

    const handleSave = (): void => {
        if (!title.trim()) {
            alert('Title is required');
            return;
        }

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
    };

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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {editingCard ? 'Edit Card' : 'Add New Card'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus-visible"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Cover URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cover Image URL
                            </label>
                            <input
                                type="url"
                                value={coverUrl}
                                onChange={(e) => setCoverUrl(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="https://example.com/image.jpg"
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

                        {/* Link */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Link (Optional)
                            </label>
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="https://example.com"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Add a link to reference the original source
                            </p>
                        </div>
                        
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Enter card title"
                                required
                            />
                        </div>
                        
                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Content (Optional)
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={8}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
                                placeholder="Add rich text or markdown content here..."
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Supports HTML and Markdown formatting
                            </p>
                        </div>
                        
                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Type a tag and press Enter"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Press Enter to add tags
                            </p>
                            
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
                        
                        {/* Action buttons */}
                        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                {editingCard && onDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus-visible transition-colors"
                                    >
                                        Delete Card
                                    </button>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus-visible transition-colors"
                                >
                                    {editingCard ? 'Save Changes' : 'Add Card'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCardModal;