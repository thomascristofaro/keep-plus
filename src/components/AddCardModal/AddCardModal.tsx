import React, { useState } from 'react';
import type { Card, CardFormData, FormErrors } from '../../types/index.ts';

/**
 * Props for the AddCardModal component
 */
export interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: Card) => void;
}

/**
 * Modal component for adding a new card
 */
const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAddCard }) => {
    const [formData, setFormData] = useState<CardFormData>({
        title: '',
        description: '',
        url: '',
        type: 'link',
        tags: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        
        if (!formData.url.trim()) {
            newErrors.url = 'URL is required';
        } else {
            try {
                new URL(formData.url);
            } catch {
                newErrors.url = 'Please enter a valid URL';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (validateForm()) {
            const newCard: Card = {
                id: Date.now(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                url: formData.url.trim(),
                type: formData.type,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                created_at: new Date().toISOString()
            };
            onAddCard(newCard);
            setFormData({ title: '', description: '', url: '', type: 'link', tags: '' });
            setErrors({});
            onClose();
        }
    };

    const handleChange = (field: keyof CardFormData, value: string): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Add New Card
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
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Enter card title"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                placeholder="Enter card description"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                URL *
                            </label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => handleChange('url', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                    errors.url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="https://example.com"
                            />
                            {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Type
                            </label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="link"
                                        checked={formData.type === 'link'}
                                        onChange={(e) => handleChange('type', e.target.value as 'link' | 'image')}
                                        className="mr-2 text-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Link</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="image"
                                        checked={formData.type === 'image'}
                                        onChange={(e) => handleChange('type', e.target.value as 'link' | 'image')}
                                        className="mr-2 text-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Image</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tags
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => handleChange('tags', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="React, JavaScript, Design (comma separated)"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Separate tags with commas
                            </p>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus-visible transition-colors"
                            >
                                Add Card
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCardModal;