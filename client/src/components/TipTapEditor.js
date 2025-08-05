import React, { useImperativeHandle, forwardRef, useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import InfoBlock from './InfoBlock';
import { ResizableImage } from './ResizableImage';
import './TipTapEditor.css';

const TipTapEditor = forwardRef(({ value, onChange, placeholder = 'Введите текст...' }, ref) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, type: null });
  const dropdownRef = useRef(null);
  const tableDropdownRef = useRef(null);
  const toolsDropdownRef = useRef(null);
  const contextMenuRef = useRef(null);
  
  // Функция для позиционирования контекстного меню над курсором
  const getMenuPosition = (x, y) => {
    const offset = 8; // небольшой отступ над курсором
    const menuWidth = 800; // примерная ширина меню
    let finalX = x - menuWidth / 2; // центрируем меню относительно курсора
    let finalY = y - offset;
    
    // Проверяем, чтобы меню не выходило за левый край
    if (finalX < 0) {
      finalX = 10;
    }
    if (finalX + menuWidth > window.innerWidth) {
      finalX = window.innerWidth - menuWidth - 10;
    }
    
    // Если не помещается сверху, показываем чуть ниже курсора
    if (finalY < 0) {
      finalY = y + offset;
    }
    return { x: finalX, y: finalY };
  };

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
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(event.target)) {
        setShowTableMenu(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setShowToolsMenu(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ show: false, x: 0, y: 0, type: null });
      }
    };

    const handleResize = () => {
      // Закрываем контекстное меню при изменении размера окна
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, type: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [contextMenu.show]);

  // Дебаунсинг для onUpdate
  const debouncedOnChange = useRef(null);
  
  useEffect(() => {
    debouncedOnChange.current = (html) => {
      setTimeout(() => onChange(html), 0);
    };
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'tiptap-resizable-image',
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
      Table.configure({
        resizable: true,
        handleWidth: 8,
        cellMinWidth: 100,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      InfoBlock, // Добавляем наш кастомный InfoBlock
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (debouncedOnChange.current) {
        debouncedOnChange.current(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
      handleDOMEvents: {
        contextmenu: (view, event) => {
          // Проверяем, находимся ли мы в таблице
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          
          // Ищем родительский элемент таблицы
          let isInTable = false;
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === 'table') {
              isInTable = true;
              break;
            }
          }
          
          if (isInTable) {
            event.preventDefault();
            
            // Позиционируем меню над курсором
            const position = getMenuPosition(event.clientX, event.clientY);
            
            setContextMenu({
              show: true,
              x: position.x,
              y: position.y,
              type: 'table'
            });
            return true; // Возвращаем true, чтобы указать что событие обработано
          }
          
          return false; // Позволяем стандартное поведение для не-таблиц
        }
      }
    },
  });

  // Предоставляем методы для работы с редактором через ref
  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
    insertImage: (url) => {
      if (editor) {
        // Убеждаемся, что изображение вставляется в текущую позицию курсора
        const currentSelection = editor.state.selection;
        editor.chain()
          .focus()
          .setTextSelection(currentSelection.anchor)
          .setResizableImage({ src: url })
          .run();
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
        <div className="toolbar-separator"></div>
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
        <div className="tools-dropdown" ref={toolsDropdownRef}>
          <button
            type="button"
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className={showToolsMenu ? 'is-active' : ''}
          >
            🛠️ Инструменты ▼
          </button>
          {showToolsMenu && (
            <div className="tools-menu">
              <button
                type="button"
                className="tools-menu-item"
                onClick={() => {
                  editor.chain().focus().toggleBlockquote().run();
                  setShowToolsMenu(false);
                }}
              >
                <span className="tool-icon">"</span>
                <span className="tool-label">Цитата</span>
              </button>
              <button
                type="button"
                className="tools-menu-item"
                onClick={() => {
                  // Сохраняем текущую позицию курсора перед открытием диалога
                  const currentSelection = editor.state.selection;
                  const currentPosition = currentSelection.anchor;
                  
                  const input = document.createElement('input');
                  input.setAttribute('type', 'file');
                  input.setAttribute('accept', 'image/*');
                  input.click();
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const url = e.target.result;
                        // Восстанавливаем позицию курсора и вставляем изображение
                        editor.chain()
                          .focus()
                          .setTextSelection(currentPosition)
                          .setResizableImage({ src: url })
                          .run();
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  setShowToolsMenu(false);
                }}
              >
                <span className="tool-icon">🖼️</span>
                <span className="tool-label">Изображение</span>
              </button>
              <div className="tools-separator"></div>
              <button
                type="button"
                className="tools-menu-item"
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  setShowToolsMenu(false);
                }}
                disabled={!editor.can().insertTable()}
              >
                <span className="tool-icon">📊</span>
                <span className="tool-label">Таблица</span>
              </button>
            </div>
          )}
        </div>
      </div>
        
      {/* Контекстное меню для таблиц */}
      {contextMenu.show && contextMenu.type === 'table' && (
        <div 
          ref={contextMenuRef}
          className="context-menu"
            style={{ 
              left: contextMenu.x, 
              top: contextMenu.y,
              position: 'fixed'
            }}
          >
            <div className="context-menu-section">
              <div className="context-menu-title">Столбцы</div>
              <button
                type="button"
                className="context-menu-item"
                onClick={() => {
                  editor.chain().focus().addColumnBefore().run();
                  setContextMenu({ show: false, x: 0, y: 0, type: null });
                }}
                disabled={!editor.can().addColumnBefore()}
              >
                ← Добавить столбец слева
              </button>
              <button
                type="button"
                className="context-menu-item"
                onClick={() => {
                  editor.chain().focus().addColumnAfter().run();
                  setContextMenu({ show: false, x: 0, y: 0, type: null });
                }}
                disabled={!editor.can().addColumnAfter()}
              >
                Добавить столбец справа →
              </button>
              <button
                type="button"
                className="context-menu-item danger"
                onClick={() => {
                  editor.chain().focus().deleteColumn().run();
                  setContextMenu({ show: false, x: 0, y: 0, type: null });
                }}
                disabled={!editor.can().deleteColumn()}
              >
                🗑️ Удалить столбец
              </button>
            </div>
            <div className="context-menu-separator"></div>
            <div className="context-menu-section">
              <div className="context-menu-title">Строки</div>
              <button
                type="button"
                className="context-menu-item"
                onClick={() => {
                  editor.chain().focus().addRowBefore().run();
                  setContextMenu({ show: false, x: 0, y: 0, type: null });
                }}
                disabled={!editor.can().addRowBefore()}
              >
                ↑ Добавить строку сверху
              </button>
              <button
                type="button"
                className="context-menu-item"
                onClick={() => {
                  editor.chain().focus().addRowAfter().run();
                  setContextMenu({ show: false, x: 0, y: 0, type: null });
                }}
                disabled={!editor.can().addRowAfter()}
              >
                Добавить строку снизу ↓
              </button>
              <button
                type="button"
                className="context-menu-item danger"
                onClick={() => {
                  editor.chain().focus().deleteRow().run();
                  setContextMenu({ show: false, x: 0, y: 0, type: null });
                }}
                disabled={!editor.can().deleteRow()}
              >
                🗑️ Удалить строку
              </button>
            </div>
            <div className="context-menu-separator"></div>
            <div className="context-menu-section">
              <div className="context-menu-title">Ячейки</div>
              <button
                type="button"
                className="context-menu-item"
                onClick={() => {
                  editor.chain().focus().mergeCells().run();
                  setContextMenu({ show: false, x: 0, y: 0, type: null });
                }}
                disabled={!editor.can().mergeCells()}
              >
                🔗 Объединить ячейки
              </button>
              <button
                type="button"
                className="context-menu-item"
                onClick={() => {
                  editor.chain().focus().splitCell().run();
                  setContextMenu({ show: false, x: 0, y: 0, type: null });
                }}
                disabled={!editor.can().splitCell()}
              >
                📝 Разделить ячейки
              </button>
            </div>
            <div className="context-menu-separator"></div>
            <div className="context-menu-section">
              <button
                type="button"
                className="context-menu-item danger"
                onClick={() => {
                  if (window.confirm('Вы уверены, что хотите удалить всю таблицу?')) {
                    editor.chain().focus().deleteTable().run();
                  }
                  setContextMenu({ show: false, x: 0, y: 0, type: null });
                }}
                disabled={!editor.can().deleteTable()}
              >
                🗑️ Удалить всю таблицу
              </button>
            </div>
          </div>
        )}

        {/* Область редактирования */}
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    );
});

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor;