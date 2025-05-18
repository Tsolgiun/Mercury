import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import { Block } from '../../context/PostContext';
import DragHandle from './extensions/DragHandle';
import './RichTextEditor.css';

// Icons
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiCodeLine,
  RiLink,
  RiH1,
  RiH2,
  RiH3,
  RiListOrdered,
  RiListUnordered,
  RiDoubleQuotesL,
  RiImage2Line,
  RiAlignLeft,
  RiAlignCenter,
  RiAlignRight,
  RiFileCodeLine,
  RiSeparator,
  RiText,
} from 'react-icons/ri';

interface RichTextEditorProps {
  initialBlocks?: Block[];
  onChange: (blocks: Block[]) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialBlocks = [], onChange }) => {
  // Convert blocks to TipTap content
  const getInitialContent = useCallback(() => {
    if (!initialBlocks.length) {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [],
          },
        ],
      };
    }

    const content: any[] = [];

    initialBlocks.forEach((block) => {
      switch (block.type) {
        case 'paragraph':
          content.push({
            type: 'paragraph',
            content: block.content
              ? [{ type: 'text', text: block.content }]
              : [],
          });
          break;
        case 'heading':
          content.push({
            type: 'heading',
            attrs: { level: block.level || 2 },
            content: block.content
              ? [{ type: 'text', text: block.content }]
              : [],
          });
          break;
        case 'image':
          if (block.url) {
            content.push({
              type: 'image',
              attrs: {
                src: block.url,
                alt: block.content || '',
                title: block.content || '',
              },
            });
          }
          break;
        case 'quote':
          content.push({
            type: 'blockquote',
            content: block.content
              ? [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: block.content }],
                  },
                ]
              : [],
          });
          break;
        case 'code':
          content.push({
            type: 'codeBlock',
            attrs: { language: block.language || 'plain' },
            content: block.content
              ? [{ type: 'text', text: block.content }]
              : [],
          });
          break;
        case 'list':
          if (block.items && block.items.length) {
            const listItems = block.items.map((item) => ({
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: item }],
                },
              ],
            }));
            content.push({
              type: 'bulletList',
              content: listItems,
            });
          }
          break;
        default:
          break;
      }
    });

    return {
      type: 'doc',
      content: content.length ? content : [{ type: 'paragraph', content: [] }],
    };
  }, [initialBlocks]);

  // Convert TipTap content to blocks
  const convertContentToBlocks = useCallback((content: any): Block[] => {
    if (!content || !content.content) return [];

    const blocks: Block[] = [];

    content.content.forEach((node: any) => {
      switch (node.type) {
        case 'paragraph':
          blocks.push({
            type: 'paragraph',
            content: node.content?.[0]?.text || '',
          });
          break;
        case 'heading':
          blocks.push({
            type: 'heading',
            level: node.attrs?.level || 2,
            content: node.content?.[0]?.text || '',
          });
          break;
        case 'image':
          blocks.push({
            type: 'image',
            url: node.attrs?.src || '',
            content: node.attrs?.alt || '',
          });
          break;
        case 'blockquote':
          blocks.push({
            type: 'quote',
            content:
              node.content?.[0]?.content?.[0]?.text || '',
          });
          break;
        case 'codeBlock':
          blocks.push({
            type: 'code',
            language: node.attrs?.language || 'plain',
            content: node.content?.[0]?.text || '',
          });
          break;
        case 'bulletList':
        case 'orderedList':
          const items = node.content?.map(
            (item: any) => item.content?.[0]?.content?.[0]?.text || ''
          ) || [];
          blocks.push({
            type: 'list',
            items,
          });
          break;
        default:
          break;
      }
    });

    return blocks;
  }, []);

  // Set up the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlock.configure({
        languageClassPrefix: 'language-',
      }),
      DragHandle,
    ],
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const blocks = convertContentToBlocks(json);
      onChange(blocks);
    },
  });

  // State for editor focus
  const [isFocused, setIsFocused] = useState(false);
  
  // Handle editor focus and blur
  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    editor.on('focus', handleFocus);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('focus', handleFocus);
      editor.off('blur', handleBlur);
    };
  }, [editor]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Keyboard shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
            break;
          case 'i':
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
            break;
          case '1':
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
            break;
          case '2':
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
            break;
          case '3':
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
            break;
        }
      }
    };

    editor.view.dom.addEventListener('keydown', handleKeyDown);

    return () => {
      editor.view.dom.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  // Create toolbar component
  const Toolbar = () => {
    if (!editor) return null;
    
    return (
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <RiBold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <RiItalic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
            title="Strikethrough"
          >
            <RiStrikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`}
            title="Code"
          >
            <RiCodeLine className="w-4 h-4" />
          </button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`toolbar-button ${editor.isActive('paragraph') ? 'active' : ''}`}
            title="Text"
          >
            <RiText className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            title="Heading 1"
          >
            <RiH1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            title="Heading 2"
          >
            <RiH2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            title="Heading 3"
          >
            <RiH3 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet List"
          >
            <RiListUnordered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered List"
          >
            <RiListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
            title="Quote"
          >
            <RiDoubleQuotesL className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
            title="Code Block"
          >
            <RiFileCodeLine className="w-4 h-4" />
          </button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button
            onClick={() => {
              const url = prompt('Enter URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              } else if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
              }
            }}
            className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
            title="Link"
          >
            <RiLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter image URL');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            className="toolbar-button"
            title="Image"
          >
            <RiImage2Line className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="toolbar-button"
            title="Horizontal Rule"
          >
            <RiSeparator className="w-4 h-4" />
          </button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="Align Left"
          >
            <RiAlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="Align Center"
          >
            <RiAlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="Align Right"
          >
            <RiAlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (!editor) {
    return null;
  }

  // Add a class to the editor container when focused
  const editorClasses = `rich-text-editor ${isFocused ? 'is-focused' : ''}`;

  // Handle click on editor container to focus
  const handleEditorClick = () => {
    if (editor && !editor.isFocused) {
      editor.commands.focus();
    }
  };

  return (
    <div className={editorClasses} onClick={handleEditorClick}>
      <Toolbar />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
