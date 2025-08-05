import { Node, mergeAttributes } from '@tiptap/core';

export const ResizableImage = Node.create({
  name: 'resizableImage',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => ({
          src: element.getAttribute('src'),
          alt: element.getAttribute('alt'),
          title: element.getAttribute('title'),
          width: element.getAttribute('width'),
          height: element.getAttribute('height'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ({ node, updateAttributes, getPos, editor }) => {
      console.log('🏗️ Creating nodeView at position:', typeof getPos === 'function' ? getPos() : 'unknown');
      console.log('🏗️ Node attrs:', node.attrs);
      
      const container = document.createElement('div');
      container.className = 'resizable-image-container';
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.maxWidth = '100%';

      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.title = node.attrs.title || '';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      
      // Устанавливаем размеры из атрибутов
      if (node.attrs.width) {
        console.log('🔧 Setting initial width:', node.attrs.width);
        img.style.width = node.attrs.width + 'px';
      }
      if (node.attrs.height) {
        console.log('🔧 Setting initial height:', node.attrs.height);
        img.style.height = node.attrs.height + 'px';
      }

      // Создаем элементы для изменения размера
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      resizeHandle.style.position = 'absolute';
      resizeHandle.style.bottom = '0';
      resizeHandle.style.right = '0';
      resizeHandle.style.width = '12px';
      resizeHandle.style.height = '12px';
      resizeHandle.style.backgroundColor = '#007bff';
      resizeHandle.style.cursor = 'nw-resize';
      resizeHandle.style.borderRadius = '2px';
      resizeHandle.style.opacity = '0';
      resizeHandle.style.transition = 'opacity 0.2s';

      let isResizing = false;
      let startX, startY, startWidth, startHeight;

      // Показываем handle при наведении
      container.addEventListener('mouseenter', () => {
        resizeHandle.style.opacity = '1';
      });

      container.addEventListener('mouseleave', () => {
        if (!isResizing) {
          resizeHandle.style.opacity = '0';
        }
      });

      // Обработка изменения размера
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;

        const handleMouseMove = (e) => {
          if (!isResizing) return;

          const deltaX = e.clientX - startX;
          // const deltaY = e.clientY - startY; // не используется

          // Вычисляем новые размеры, сохраняя пропорции
          const aspectRatio = startHeight / startWidth;
          let newWidth = startWidth + deltaX;

          // Ограничиваем минимальный размер
          if (newWidth < 50) newWidth = 50;
          // Проверяем существование parentElement
          if (container.parentElement && newWidth > container.parentElement.offsetWidth) {
            newWidth = container.parentElement.offsetWidth;
          }

          const newHeight = newWidth * aspectRatio;

          img.style.width = newWidth + 'px';
          img.style.height = newHeight + 'px';
        };

        const handleMouseUp = () => {
          if (!isResizing) {
            return;
          }
          
          // Сразу устанавливаем флаг в false и удаляем обработчики
          isResizing = false;
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          
          resizeHandle.style.opacity = '0';
          
          const newWidth = img.offsetWidth;
          const newHeight = img.offsetHeight;
          const currentPos = typeof getPos === 'function' ? getPos() : 'unknown';
          
          // Проверяем и корректируем пропорции
          const naturalAspectRatio = img.naturalWidth / img.naturalHeight;
          const currentAspectRatio = newWidth / newHeight;
          
          let finalWidth = newWidth;
          let finalHeight = newHeight;
          
          // Если соотношение сильно отличается, корректируем
          if (Math.abs(naturalAspectRatio - currentAspectRatio) > 0.1) {
            console.log('� Correcting aspect ratio from', currentAspectRatio, 'to', naturalAspectRatio);
            finalHeight = Math.round(finalWidth / naturalAspectRatio);
            // Применяем исправленные размеры к элементу
            img.style.height = finalHeight + 'px';
          }
          
          console.log('�🖱️ Resize completed at position:', currentPos, 'New size:', { width: finalWidth, height: finalHeight });
          
          // Проверяем валидность размеров
          if (finalWidth <= 0 || finalHeight <= 0) {
            console.warn('❌ Invalid size, skipping update');
            return;
          }
          
          // Обновляем атрибуты узла
          if (typeof updateAttributes === 'function') {
            console.log('📝 Using updateAttributes at pos:', currentPos);
            updateAttributes({
              width: finalWidth,
              height: finalHeight,
            });
          } else if (editor && typeof getPos === 'function') {
            const pos = getPos();
            console.log('📝 Using direct transaction at pos:', pos);
            if (pos !== undefined && pos !== null) {
              // Используем только прямую транзакцию, так как updateAttributes не работает надежно
              const { state, view } = editor;
              const tr = state.tr;
              const nodeAtPos = state.doc.nodeAt(pos);
              
              console.log('� Node at position:', nodeAtPos?.type.name, nodeAtPos?.attrs);
              
              if (nodeAtPos && nodeAtPos.type.name === 'resizableImage') {
                const newAttrs = { ...nodeAtPos.attrs, width: finalWidth, height: finalHeight };
                console.log('📝 Setting new attrs:', newAttrs);
                tr.setNodeMarkup(pos, null, newAttrs);
                view.dispatch(tr);
                console.log('✅ Direct transaction applied');
              } else {
                console.warn('❌ Node not found or wrong type at position:', pos);
              }
            }
          }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });

      container.appendChild(img);
      container.appendChild(resizeHandle);

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false;
          }
          
          const currentPos = typeof getPos === 'function' ? getPos() : 'unknown';
          console.log('🔄 Update called at position:', currentPos, 'isResizing:', isResizing);
          console.log('📊 Updated node attrs:', updatedNode.attrs);
          console.log('📏 Current img size:', { width: img.offsetWidth, height: img.offsetHeight });
          
          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || '';
          img.title = updatedNode.attrs.title || '';
          
          // Обновляем размеры только если они изменились в атрибутах
          // и при этом не происходит активное изменение размера
          if (!isResizing) {
            if (updatedNode.attrs.width && updatedNode.attrs.width !== img.offsetWidth) {
              console.log('🔧 Setting width from attrs:', updatedNode.attrs.width, 'at pos:', currentPos);
              img.style.width = updatedNode.attrs.width + 'px';
            }
            if (updatedNode.attrs.height && updatedNode.attrs.height !== img.offsetHeight) {
              console.log('🔧 Setting height from attrs:', updatedNode.attrs.height, 'at pos:', currentPos);
              img.style.height = updatedNode.attrs.height + 'px';
            }
            
            // Сбрасываем размеры только если они явно убраны из атрибутов
            if (!updatedNode.attrs.width && img.style.width) {
              console.log('🗑️ Clearing width style at pos:', currentPos);
              img.style.width = '';
            }
            if (!updatedNode.attrs.height && img.style.height) {
              console.log('🗑️ Clearing height style at pos:', currentPos);
              img.style.height = '';
            }
          } else {
            console.log('⏸️ Skipping size update - currently resizing at pos:', currentPos);
          }
          
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      setResizableImage: (options) => ({ commands }) => {
        // Если width/height не заданы, создаём временное изображение, чтобы получить их
        let { src, width, height, ...rest } = options;
        if (!width || !height) {
          const tempImg = document.createElement('img');
          tempImg.src = src;
          width = width || tempImg.naturalWidth || 300;
          height = height || tempImg.naturalHeight || 200;
        }
        return commands.insertContent({
          type: this.name,
          attrs: { src, width, height, ...rest },
        });
      },
    };
  },

  addProseMirrorPlugins() {
    return [];
  },
});
