import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import { Block } from '../../context/PostContext';
import DragHandle from './extensions/DragHandle';
import SlashCommands from './extensions/SlashCommands';
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
        placeholder: 'Type / for commands...',
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
      SlashCommands,
    ],
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const blocks = convertContentToBlocks(json);
      onChange(blocks);
    },
  });

  // Handle slash commands
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashCommand, setSlashCommand] = useState('');

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        const { view } = editor;
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;
        
        // Get coordinates for slash menu
        const coords = view.coordsAtPos($from.pos);
        setSlashMenuPosition({ x: coords.left, y: coords.bottom });
        setShowSlashMenu(true);
        setSlashCommand('');
      } else if (e.key === 'Escape' && showSlashMenu) {
        setShowSlashMenu(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (showSlashMenu && e.key !== '/') {
        if (e.key === 'Escape') {
          setShowSlashMenu(false);
        } else {
          // Update slash command
          const text = editor.getText();
          const lastSlashIndex = text.lastIndexOf('/');
          if (lastSlashIndex !== -1) {
            setSlashCommand(text.slice(lastSlashIndex + 1));
          }
        }
      }
    };

    editor.view.dom.addEventListener('keydown', handleKeyDown);
    editor.view.dom.addEventListener('keyup', handleKeyUp);

    return () => {
      editor.view.dom.removeEventListener('keydown', handleKeyDown);
      editor.view.dom.removeEventListener('keyup', handleKeyUp);
    };
  }, [editor, showSlashMenu]);

  // Slash menu commands
  const slashCommands = [
    {
      title: 'Text',
      description: 'Just start writing with plain text.',
      icon: <RiAlignLeft className="w-5 h-5" />,
      action: () => {
        editor?.chain().focus().setParagraph().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: 'Heading 1',
      description: 'Large section heading.',
      icon: <RiH1 className="w-5 h-5" />,
      action: () => {
        editor?.chain().focus().setHeading({ level: 1 }).run();
        setShowSlashMenu(false);
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: <RiH2 className="w-5 h-5" />,
      action: () => {
        editor?.chain().focus().setHeading({ level: 2 }).run();
        setShowSlashMenu(false);
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: <RiH3 className="w-5 h-5" />,
      action: () => {
        editor?.chain().focus().setHeading({ level: 3 }).run();
        setShowSlashMenu(false);
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list.',
      icon: <RiListUnordered className="w-5 h-5" />,
      action: () => {
        editor?.chain().focus().toggleBulletList().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list.',
      icon: <RiListOrdered className="w-5 h-5" />,
      action: () => {
        editor?.chain().focus().toggleOrderedList().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      icon: <RiDoubleQuotesL className="w-5 h-5" />,
      action: () => {
        editor?.chain().focus().toggleBlockquote().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: 'Code',
      description: 'Capture a code snippet.',
      icon: <RiCodeLine className="w-5 h-5" />,
      action: () => {
        editor?.chain().focus().toggleCodeBlock().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: 'Image',
      description: 'Upload or embed with a link.',
      icon: <RiImage2Line className="w-5 h-5" />,
      action: () => {
        const url = prompt('Enter image URL');
        if (url) {
          editor?.chain().focus().setImage({ src: url }).run();
        }
        setShowSlashMenu(false);
      },
    },
  ];

  // Filter slash commands based on input
  const filteredCommands = slashCommand
    ? slashCommands.filter((cmd) =>
        cmd.title.toLowerCase().includes(slashCommand.toLowerCase())
      )
    : slashCommands;

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-bg border border-outline rounded-md shadow-lg p-1 flex space-x-1"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded hover:bg-hover ${
              editor.isActive('bold') ? 'bg-hover' : ''
            }`}
          >
            <RiBold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded hover:bg-hover ${
              editor.isActive('italic') ? 'bg-hover' : ''
            }`}
          >
            <RiItalic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1 rounded hover:bg-hover ${
              editor.isActive('strike') ? 'bg-hover' : ''
            }`}
          >
            <RiStrikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1 rounded hover:bg-hover ${
              editor.isActive('code') ? 'bg-hover' : ''
            }`}
          >
            <RiCodeLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              } else {
                editor.chain().focus().unsetLink().run();
              }
            }}
            className={`p-1 rounded hover:bg-hover ${
              editor.isActive('link') ? 'bg-hover' : ''
            }`}
          >
            <RiLink className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      {/* Slash menu */}
      {showSlashMenu && (
        <div
          className="absolute z-50 bg-bg border border-outline rounded-md shadow-lg p-2 w-64"
          style={{
            left: slashMenuPosition.x,
            top: slashMenuPosition.y,
          }}
        >
          <div className="text-sm text-muted mb-2">
            {slashCommand ? `Searching for "${slashCommand}"` : 'Basic blocks'}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredCommands.map((command, index) => (
              <div
                key={index}
                className="flex items-center p-2 hover:bg-hover rounded-md cursor-pointer"
                onClick={command.action}
              >
                <div className="mr-2 text-muted">{command.icon}</div>
                <div>
                  <div className="font-medium">{command.title}</div>
                  <div className="text-xs text-muted">
                    {command.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
