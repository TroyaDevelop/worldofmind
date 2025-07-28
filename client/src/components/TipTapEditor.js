import React, { useImperativeHandle, forwardRef, useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import InfoBlock from './InfoBlock';
import './TipTapEditor.css';

const TipTapEditor = forwardRef(({ value, onChange, placeholder = 'Введите текст...' }, ref) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const dropdownRef = useRef(null);
  
  const blockTypes = [
    { id: 'info', label: 'Это интересно!', icon: '💡', color: '#17a2b8' },
    { id: 'warning', label: 'Предупреждение', icon: '⚠️', color: '#ffc107' },
    { id: 'example', label: 'Пример', icon: '📝', color: '#28a745' },
    { id: 'note', label: 'Заметка', icon: '📌', color: '#6f42c1' },
    { id: 'simple', label: 'Блок', icon: '📄', color: '#6c757d' },
  ];

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBlockMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      TextStyle,
      Color,
      InfoBlock, // Добавляем наш кастомный InfoBlock
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
    },
  });

  // Предоставляем методы для работы с редактором через ref
  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
    insertImage: (url) => {
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
    insertText: (text, style = null) => {
      if (editor) {
        const chain = editor.chain().focus();
        if (style === 'italic') {
          chain.insertContent(`<em>${text}</em>`);
        } else {
          chain.insertContent(text);
        }
        chain.run();
      }
    },
    deleteText: (length) => {
      if (editor) {
        // TipTap не имеет прямого аналога deleteText
        // Можно использовать undo или другую логику
        editor.chain().focus().run();
      }
    },
    setSelection: (position) => {
      if (editor) {
        editor.chain().focus().setTextSelection(position).run();
      }
    },
  }));

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      {/* Панель инструментов */}
      <div className="tiptap-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <s>S</s>
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          • Список
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          1. Список
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          " Цитата
        </button>
        <div className="info-block-dropdown" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowBlockMenu(!showBlockMenu)}
            className={editor.isActive('infoBlock') ? 'is-active' : ''}
          >
            📦 Блоки ▼
          </button>
          {showBlockMenu && (
            <div className="info-block-menu">
              {blockTypes.map((blockType) => (
                <button
                  key={blockType.id}
                  type="button"
                  className="info-block-menu-item"
                  onClick={() => {
                    editor.chain().focus().toggleInfoBlock({ type: blockType.id }).run();
                    setShowBlockMenu(false);
                  }}
                  style={{ borderLeft: `4px solid ${blockType.color}` }}
                >
                  <span className="block-icon">{blockType.icon}</span>
                  <span className="block-label">{blockType.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          onClick={() => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (file) {
                // Создаем URL для предпросмотра
                const reader = new FileReader();
                reader.onload = (e) => {
                  const url = e.target.result;
                  editor.chain().focus().setImage({ src: url }).run();
                };
                reader.readAsDataURL(file);
              }
            };
          }}
        >
          🖼️ Изображение
        </button>
      </div>

      {/* Область редактирования */}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
});

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor;