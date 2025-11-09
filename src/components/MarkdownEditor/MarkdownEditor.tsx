import React, { useMemo } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

/**
 * Props for the MarkdownEditor component
 */
export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Markdown editor component with toolbar and live preview
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Add content here...' 
}) => {
    const options = useMemo(() => {
        return {
            spellChecker: false,
            placeholder,
            status: false,
            toolbar: [
                'bold',
                'italic',
                'strikethrough',
                '|',
                'heading-1',
                'heading-2',
                'heading-3',
                '|',
                'quote',
                'unordered-list',
                'ordered-list',
                '|',
                'link',
                'image',
                '|',
                'code',
                'table',
                '|',
                'preview',
                'side-by-side',
                'fullscreen',
                '|',
                'guide'
            ] as any,
            minHeight: '200px',
            autofocus: false,
        } as any;
    }, [placeholder]);

    return (
        <div className="markdown-editor-wrapper h-full flex flex-col">
            <SimpleMDE 
                value={value} 
                onChange={onChange}
                options={options}
            />
        </div>
    );
};

export default MarkdownEditor;
