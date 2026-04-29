"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';

import { 
    Bold, Italic, Underline as UnderlineIcon, 
    List, ListOrdered, Quote, Undo, Redo, 
    Table as TableIcon, Image as ImageIcon, 
    Link as LinkIcon, Unlink 
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto shadow-sm my-4',
                },
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-slate-900 border-t border-slate-200',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    const data = await response.json();
                    if (data.url) {
                        editor.chain().focus().setImage({ src: data.url }).run();
                    }
                } catch (error) {
                    console.error('Image upload failed:', error);
                    alert('Resim yüklenirken bir hata oluştu.');
                }
            }
        };
        input.click();
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL Girin', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="w-full border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all bg-white">
            <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleBold().run()} 
                    active={editor.isActive('bold')}
                >
                    <Bold size={18} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleItalic().run()} 
                    active={editor.isActive('italic')}
                >
                    <Italic size={18} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleUnderline().run()} 
                    active={editor.isActive('underline')}
                >
                    <UnderlineIcon size={18} />
                </ToolbarButton>
                
                <div className="w-px h-6 bg-slate-300 mx-1" />

                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleBulletList().run()} 
                    active={editor.isActive('bulletList')}
                >
                    <List size={18} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                    active={editor.isActive('orderedList')}
                >
                    <ListOrdered size={18} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                    active={editor.isActive('blockquote')}
                >
                    <Quote size={18} />
                </ToolbarButton>

                <div className="w-px h-6 bg-slate-300 mx-1" />

                <ToolbarButton 
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                >
                    <TableIcon size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={addImage}>
                    <ImageIcon size={18} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={setLink}
                    active={editor.isActive('link')}
                >
                    <LinkIcon size={18} />
                </ToolbarButton>
                {editor.isActive('link') && (
                    <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()}>
                        <Unlink size={18} />
                    </ToolbarButton>
                )}

                <div className="flex-1" />

                <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
                    <Undo size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
                    <Redo size={18} />
                </ToolbarButton>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}

function ToolbarButton({ children, onClick, active = false }: { children: React.ReactNode, onClick: () => void, active?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded-md transition-colors ${
                active 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
        >
            {children}
        </button>
    );
}
