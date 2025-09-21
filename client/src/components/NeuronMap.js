import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const NeuronNeuronsMap = ({ neurons, categories, activeCategory, isSearchActive }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const animationRef = useRef(null);
  const nodesRef = useRef([]);
  const tooltipRef = useRef(null);

  // Фильтрация нейронов в зависимости от выбранной категории
  const filteredNeurons = useMemo(() => {
    if (activeCategory === 'all') return neurons;
    
    if (activeCategory.startsWith('category_')) {
      const categoryId = parseInt(activeCategory.replace('category_', ''));
      return neurons.filter(neuron => neuron.category_id === categoryId);
    }
    
    // Для обратной совместимости со старой системой категорий
    // Также обрабатываем нейрони с пустой категорией как "Разное"
    return neurons.filter(neuron => {
      const neuronCategory = neuron.category || 'Разное';
      return neuronCategory === activeCategory;
    });
  }, [neurons, activeCategory]);

  // Инициализация анимации
  useEffect(() => {
    // Отладочная информация
    console.log('NeuronNeuronsMap: categories received:', categories);
    console.log('NeuronNeuronsMap: filteredNeurons:', filteredNeurons);
    
    if (!canvasRef.current || !containerRef.current) return;
    
    // Если нет нейронов и нет категорий, не отображаем ничего
    if (!filteredNeurons.length && (!categories || !categories.length)) return;

    // Удаляем существующий tooltip, если он есть
    if (tooltipRef.current) {
      document.body.removeChild(tooltipRef.current);
      tooltipRef.current = null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;

    // Устанавливаем размеры канваса равными размерам контейнера
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = Math.max(500, container.clientHeight); // Минимальная высота 500px
    };

    // Вызываем функцию изменения размера
    resizeCanvas();

    // Подписываемся на изменение размера окна
    window.addEventListener('resize', resizeCanvas);

    // Функция для получения случайного числа в заданном диапазоне
    const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
    
    // Создаем декоративные фоновые частицы для красивого визуального эффекта
    const backgroundParticles = Array.from({ length: 50 }, () => ({
      x: getRandomNumber(0, canvas.width),
      y: getRandomNumber(0, canvas.height),
      radius: getRandomNumber(1.5, 3.5),
      vx: getRandomNumber(-0.2, 0.2),
      vy: getRandomNumber(-0.2, 0.2),
      alpha: getRandomNumber(0.4, 0.9)
    }));
    
    // Адаптивный размер нейронов в зависимости от количества нейронов
    
    // Создаем все узлы: категории, подкатегории и нейрони
    const createHierarchicalNodes = () => {
      const allNodes = [];
      
      // Создаем узлы категорий только если они содержат отфильтрованные нейрони
      if (categories && categories.length > 0) {
        categories.filter(category => 
          category.name && category.name.trim() !== '' && category.name !== 'Разное'
        ).forEach((category) => {
          // Проверяем, есть ли нейрони в этой категории среди отфильтрованных
          const categoryHasNeurons = filteredNeurons.some(neuron => neuron.category_id === category.id);
          const showAllCategories = activeCategory === 'all' && !isSearchActive; // При поиске не показываем пустые категории
          const isSelectedCategory = activeCategory === `category_${category.id}`;
          
          // Показываем категорию если:
          // 1. В ней есть нейроны
          // 2. Выбраны все категории И НЕ активен поиск (показываем все, даже пустые)
          // 3. Эта категория выбрана конкретно
          if (categoryHasNeurons || showAllCategories || isSelectedCategory) {
            const x = getRandomNumber(canvas.width * 0.1, canvas.width * 0.9);
            const y = getRandomNumber(canvas.height * 0.1, canvas.height * 0.9);
            const vx = getRandomNumber(-0.05, 0.05);
            const vy = getRandomNumber(-0.05, 0.05);
            
            allNodes.push({
              id: `category_${category.id}`,
              type: 'category',
              x,
              y,
              vx,
              vy,
              radius: 8, // Еще меньший размер для категорий
              color: category.color || '#3498db',
              title: category.name,
              description: category.description || '',
              category: category.name,
              data: category,
              connections: []
            });
            
            // Создаем узлы подкатегорий только если они содержат отфильтрованные нейрони
            if (category.subcategories && category.subcategories.length > 0) {
              category.subcategories.filter(subcategory =>
                subcategory.name && subcategory.name.trim() !== ''
              ).forEach((subcategory) => {
                const subcategoryHasNeurons = filteredNeurons.some(neuron => neuron.subcategory_id === subcategory.id);
                
                // Показываем подкатегорию если:
                // 1. В ней есть нейроны
                // 2. Выбраны все категории И НЕ активен поиск (показываем все, даже пустые)
                // 3. Выбрана родительская категория этой подкатегории
                if (subcategoryHasNeurons || showAllCategories || isSelectedCategory) {
                  const x = getRandomNumber(canvas.width * 0.1, canvas.width * 0.9);
                  const y = getRandomNumber(canvas.height * 0.1, canvas.height * 0.9);
                  const vx = getRandomNumber(-0.06, 0.06);
                  const vy = getRandomNumber(-0.06, 0.06);
                  
                  allNodes.push({
                    id: `subcategory_${subcategory.id}`,
                    type: 'subcategory',
                    x,
                    y,
                    vx,
                    vy,
                    radius: 5, // Еще меньший размер для подкатегорий
                    color: subcategory.color || '#2ecc71',
                    title: subcategory.name,
                    description: subcategory.description || '',
                    category: category.name,
                    data: subcategory,
                    parentId: `category_${category.id}`,
                    connections: [`category_${category.id}`]
                  });
                }
              });
            }
          }
        });
      } else {
        // No categories provided, creating neurons only
      }
      
      // Создаем узлы нейронов
      filteredNeurons.forEach((neuron) => {
        const x = getRandomNumber(canvas.width * 0.04, canvas.width * 0.96);
        const y = getRandomNumber(canvas.height * 0.04, canvas.height * 0.96);
        const vx = getRandomNumber(-0.08, 0.08);
        const vy = getRandomNumber(-0.08, 0.08);
        
        const color = neuron.color || `hsl(${getRandomNumber(0, 360)}, 70%, 60%)`;
        
        const neuronNode = {
          id: `neuron_${neuron.id}`,
          type: 'neuron',
          x,
          y,
          vx,
          vy,
          radius: 3, // Еще меньший размер для нейронов
          color,
          title: neuron.article,
          description: neuron.description || '',
          category: neuron.category || 'Разное', // Используем "Разное" если категория пустая
          data: neuron,
          connections: []
        };
        
        // Связываем нейрон с подкатегорией или категорией
        if (neuron.subcategory_id) {
          const parentId = `subcategory_${neuron.subcategory_id}`;
          neuronNode.connections.push(parentId);
          neuronNode.parentId = parentId;
        } else if (neuron.category_id) {
          const parentId = `category_${neuron.category_id}`;
          neuronNode.connections.push(parentId);
          neuronNode.parentId = parentId;
        } else if (!neuron.category || neuron.category.trim() === '') {
          // Нейрон без категории - присваиваем "Разное"
          neuronNode.category = 'Разное';
        }
        
        allNodes.push(neuronNode);
      });
      
      // Добавляем обратные связи от родителей к детям
      allNodes.forEach(node => {
        if (node.connections.length > 0) {
          node.connections.forEach(parentId => {
            const parentNode = allNodes.find(n => n.id === parentId);
            if (parentNode && !parentNode.connections.includes(node.id)) {
              parentNode.connections.push(node.id);
            }
          });
        }
      });
      
      return allNodes;
    };

    const nodes = createHierarchicalNodes();

    nodesRef.current = nodes;

    // Создаем HTML-элемент подсказки и добавляем его в body
    const createTooltip = () => {
      const tooltip = document.createElement('div');
      tooltip.className = 'neuron-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        transform: translate(-50%, -100%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.9rem;
        pointer-events: none;
        z-index: 9999;
        max-width: 250px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: opacity 0.2s ease;
        display: none;
      `;
      
      const titleElement = document.createElement('div');
      titleElement.style.fontWeight = 'bold';
      tooltip.appendChild(titleElement);
      
      const descriptionElement = document.createElement('div');
      descriptionElement.style.cssText = `
        font-size: 0.8rem;
        margin-top: 5px;
        opacity: 0.9;
      `;
      tooltip.appendChild(descriptionElement);
      
      document.body.appendChild(tooltip);
      return tooltip;
    };

    // Анимация и отрисовка
    const draw = () => {
      // Очищаем канвас
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Определяем, светлая ли тема
      const isLightTheme = document.body.classList.contains('dark-mode') === false;
      
      // Рисуем красивый градиентный фон
      const gradientBg = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
      );
      
      if (isLightTheme) {
        // Светлый градиентный фон с более насыщенными цветами, близкими к тёмной теме
        gradientBg.addColorStop(0, 'rgba(235, 240, 255, 1)');
        gradientBg.addColorStop(0.5, 'rgba(225, 235, 250, 0.95)');
        gradientBg.addColorStop(1, 'rgba(215, 225, 245, 0.9)');
      } else {
        // Тёмный градиентный фон
        gradientBg.addColorStop(0, 'rgba(25, 25, 35, 1)');
        gradientBg.addColorStop(1, 'rgba(15, 15, 25, 0.9)');
      }
      
      ctx.fillStyle = gradientBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем тонкий узор на фоне
      const drawPattern = () => {
        const patternSize = 30;
        const patternOpacity = isLightTheme ? 0.05 : 0.07; // Увеличиваем немного непрозрачность в светлой теме
        
        ctx.strokeStyle = isLightTheme ? `rgba(70, 90, 180, ${patternOpacity})` : `rgba(255, 255, 255, ${patternOpacity})`;
        ctx.lineWidth = 0.5;
        
        // Горизонтальные линии
        for (let y = 0; y < canvas.height; y += patternSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        // Вертикальные линии
        for (let x = 0; x < canvas.width; x += patternSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
      };
      
      // Рисуем узор
      drawPattern();
      
      // Рисуем связи между узлами - уменьшаем толщину для более изящного вида
      ctx.lineWidth = isLightTheme ? 0.8 : 0.4; // Делаем линии толще в светлой теме
      
      nodes.forEach(node => {
        node.connections.forEach(targetId => {
          const targetNode = nodes.find(n => n.id === targetId);
          if (targetNode) {
            // Рисуем линию с градиентом от цвета узла к цвету цели
            const gradient = ctx.createLinearGradient(
              node.x, node.y, targetNode.x, targetNode.y
            );
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, targetNode.color);
            
            if (isLightTheme) {
              // В светлой теме делаем тень для связей менее заметной
              ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'; // Уменьшаем непрозрачность с 0.3 до 0.15
              ctx.shadowBlur = 1; // Уменьшаем размытие с 2 до 1
            }
            
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.stroke();
            
            // Сбрасываем тень после отрисовки связи
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }
        });
      });
      
      // Рисуем узлы (нейроны)
      nodes.forEach(node => {
        // Обновляем позицию для анимации
        node.x += node.vx;
        node.y += node.vy;
        
        // Отражаем от стенок с небольшим смещением
        // Уменьшаем отступ для более плотного расположения
        const padding = 20;
        if (node.x < padding || node.x > canvas.width - padding) {
          node.vx = -node.vx;
          node.x = Math.max(padding, Math.min(node.x, canvas.width - padding));
        }
        if (node.y < padding || node.y > canvas.height - padding) {
          node.vy = -node.vy;
          node.y = Math.max(padding, Math.min(node.y, canvas.height - padding));
        }
        
        // Проверяем, светлая ли тема (проверка по цвету фона)
        const isLightTheme = document.body.classList.contains('dark-mode') === false;
        
        if (isLightTheme) {
          // Уменьшаем тень для светлой темы, делаем её более субтильной
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'; // Снижаем непрозрачность с 0.5 до 0.2
          ctx.shadowBlur = 3; // Уменьшаем размытие с 6 до 3
          ctx.shadowOffsetX = 0.5; // Уменьшаем смещение с 1 до 0.5
          ctx.shadowOffsetY = 0.5; // Уменьшаем смещение с 1 до 0.5
          
          // Делаем более тонкий контур
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'; // Уменьшаем непрозрачность с 0.6 до 0.3
          ctx.lineWidth = 0.5; // Уменьшаем толщину с 1 до 0.5
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 0.5, 0, Math.PI * 2); // Уменьшаем также размер контура
          ctx.stroke();
        } else {
          // Небольшая тень для темной темы
          ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
          ctx.shadowBlur = 5;
        }
        
        // Рисуем сам узел с более насыщенным цветом в светлой теме
        ctx.fillStyle = isLightTheme 
          ? node.color  // Используем оригинальный цвет
          : node.color; // В темной теме оставляем тот же цвет
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Сбрасываем тень после отрисовки нейрона
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      });
      
      // Рисуем фоновые частицы
      backgroundParticles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Отражение от краев
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx = -particle.vx;
          particle.x = Math.max(0, Math.min(particle.x, canvas.width));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy = -particle.vy;
          particle.y = Math.max(0, Math.min(particle.y, canvas.height));
        }
        
        // Цвет частиц в зависимости от темы
        if (isLightTheme) {
          // Более насыщенный и заметный синий цвет для частиц в светлой теме
          ctx.fillStyle = `rgba(70, 100, 255, ${particle.alpha * 0.6})`; // Увеличенная непрозрачность
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha * 0.5})`; // Белый цвет для темной темы
        }
        
        // Рисуем частицу
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавим более заметное свечение для частиц в обеих темах
        if (isLightTheme) {
          ctx.shadowColor = 'rgba(50, 80, 255, 0.3)'; // Уменьшаем непрозрачность с 0.6 до 0.3
          ctx.shadowBlur = 4; // Уменьшаем размытие с 7 до 4
        } else {
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 5;
        }
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Сбрасываем тени после отрисовки частицы
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });
      
      // Запускаем следующий кадр анимации
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Запускаем анимацию
    draw();

    // Создаем tooltip для отображения информации при наведении
    const tooltip = createTooltip();
    tooltipRef.current = tooltip;
    
    // Обработчик наведения мыши
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      let hoveredNode = null;
      
      // Проверяем, находится ли курсор над каким-либо узлом
      // Увеличиваем область обнаружения при меньшем размере нейронов
      const detectionMultiplier = 3; // Увеличиваем для лучшего обнаружения маленьких узлов
      
      for (let node of nodes) {
        const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
        if (distance <= node.radius * detectionMultiplier) {
          hoveredNode = node;
          break;
        }
      }
      
      if (hoveredNode) {
        // Обновляем содержимое подсказки
        const titleElement = tooltip.firstChild;
        titleElement.textContent = hoveredNode.title;
        
        const descriptionElement = tooltip.lastChild;
        let descriptionText = '';
        
        // Добавляем информацию о типе узла
        const nodeTypeText = hoveredNode.type === 'category' ? '📁 Категория' : 
                           hoveredNode.type === 'subcategory' ? '📂 Подкатегория' : 
                           '⚡ Нейрон';
        
        if (hoveredNode.description) {
          descriptionText = `${nodeTypeText}\n${hoveredNode.description}`;
        } else {
          descriptionText = nodeTypeText;
        }
        
        descriptionElement.textContent = descriptionText;
        descriptionElement.style.display = 'block';
        descriptionElement.style.whiteSpace = 'pre-line'; // Для отображения переносов строк
        
        // Позиционируем подсказку
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
        tooltip.style.display = 'block';
        setTimeout(() => {
          tooltip.style.opacity = '1';
        }, 10);
        
        canvas.style.cursor = 'pointer';
      } else {
        // Скрываем подсказку
        tooltip.style.opacity = '0';
        setTimeout(() => {
          if (tooltip.style.opacity === '0') {
            tooltip.style.display = 'none';
          }
        }, 200);
        canvas.style.cursor = 'default';
      }
    };
    
    // Обработчик выхода мыши за пределы канваса
    const handleMouseLeave = () => {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        tooltip.style.display = 'none';
      }, 200);
      canvas.style.cursor = 'default';
    };
    
    // Обработчик клика по узлу
    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Проверяем, попал ли клик в какой-либо узел
      // Увеличиваем множитель для лучшего обнаружения, особенно для маленьких нейронов
      const detectionMultiplier = 3;
      
      for (let node of nodes) {
        const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
        if (distance <= node.radius * detectionMultiplier) {
          // Переходим только к нейронам, игнорируем категории и подкатегории
          if (node.type === 'neuron') {
            navigate(`/neurons/${node.data.id}`);
          } else if (node.type === 'category' || node.type === 'subcategory') {
            // Клик по категории/подкатегории - можно добавить фильтрацию в будущем
          } else {
            // Это старый формат узла (без type), значит это нейрон
            navigate(`/neurons/${node.id}`);
          }
          break;
        }
      }
    };
    
    // Добавляем обработчики событий
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);
    
    // Очистка при размонтировании
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleCanvasClick);
      
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, [filteredNeurons, categories, activeCategory, isSearchActive, navigate]);

  return (
    <div className="neuron-map-container" ref={containerRef}>
      <canvas ref={canvasRef} className="neuron-map-canvas"></canvas>
      
      {!filteredNeurons.length && (!categories || !categories.length) && (
        <div className="no-neurons-message">
          <p>Нет нейронов и категорий для отображения</p>
        </div>
      )}
    </div>
  );
};

export default NeuronNeuronsMap;