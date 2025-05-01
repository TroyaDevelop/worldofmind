import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const NeuronSkillsMap = ({ skills, activeCategory }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const animationRef = useRef(null);
  const nodesRef = useRef([]);
  const tooltipRef = useRef(null);

  // Фильтрация навыков в зависимости от выбранной категории
  const filteredSkills = useMemo(() => {
    return activeCategory === 'all'
      ? skills
      : skills.filter(skill => skill.category === activeCategory);
  }, [skills, activeCategory]);

  // Инициализация анимации
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !filteredSkills.length) return;

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
    
    // Адаптивный размер нейронов в зависимости от количества навыков
    const getNodeRadius = (count) => {
      if (count <= 10) return 6; // Для малого количества навыков
      if (count <= 30) return 5; // Для среднего количества
      if (count <= 50) return 4; // Для большого количества
      return 3; // Для очень большого количества
    };
    
    // Определяем размер нейронов на основе количества
    const nodeRadius = getNodeRadius(filteredSkills.length);

    // Создаем узлы для навыков
    const nodes = filteredSkills.map((skill) => {
      // Создаем случайное распределение узлов по всей площади канваса
      // Уменьшаем отступы от края для более плотного расположения
      const x = getRandomNumber(canvas.width * 0.04, canvas.width * 0.96);
      const y = getRandomNumber(canvas.height * 0.04, canvas.height * 0.96);
      
      // Уменьшаем скорость движения для более стабильного отображения
      const vx = getRandomNumber(-0.08, 0.08);
      const vy = getRandomNumber(-0.08, 0.08);
      
      // Используем цвет навыка или случайный цвет
      const color = skill.color || `hsl(${getRandomNumber(0, 360)}, 70%, 60%)`;
      
      return {
        id: skill.id,
        x,
        y,
        vx,
        vy,
        radius: nodeRadius, // Уменьшенный адаптивный размер узла
        color,
        title: skill.article,
        description: skill.description || '',
        category: skill.category,
        connections: [] // Связи с другими узлами
      };
    });

    nodesRef.current = nodes;

    // Создаем связи между узлами одной категории
    const categoryMap = {};
    
    nodes.forEach(node => {
      if (!categoryMap[node.category]) {
        categoryMap[node.category] = [];
      }
      categoryMap[node.category].push(node);
    });
    
    // Для каждой категории создаем связи между узлами
    // Адаптируем количество связей - меньше связей для большего количества узлов
    Object.values(categoryMap).forEach(categoryNodes => {
      const getOptimalConnectionCount = (count) => {
        if (count <= 5) return Math.min(count - 1, 2);
        if (count <= 15) return 2;
        return 1; // Для очень большого количества только одна связь
      };
      
      const connectionsCount = getOptimalConnectionCount(categoryNodes.length);
      
      categoryNodes.forEach(node => {
        // Соединяем каждый узел с оптимальным числом узлов из той же категории
        const nodesToConnect = Math.min(
          categoryNodes.length - 1, 
          Math.floor(getRandomNumber(1, connectionsCount + 1))
        );
        
        const connections = new Set();
        while (connections.size < nodesToConnect) {
          const randomIndex = Math.floor(Math.random() * categoryNodes.length);
          const targetNode = categoryNodes[randomIndex];
          if (targetNode.id !== node.id) {
            connections.add(targetNode.id);
          }
        }
        
        node.connections = Array.from(connections);
      });
    });

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
      
      // Рисуем связи между узлами - уменьшаем толщину для более изящного вида
      ctx.lineWidth = 0.4;
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
            
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.stroke();
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
          // Оставляем умеренную тень для светлой темы, но не слишком большую
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
        }
        
        // Рисуем сам узел без свечения
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Сбрасываем тень после отрисовки нейрона
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
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
      const detectionMultiplier = 10 / nodeRadius; // Чем меньше нейрон, тем больше множитель
      
      for (let node of nodes) {
        const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
        if (distance <= node.radius * Math.min(3, detectionMultiplier)) {
          hoveredNode = node;
          break;
        }
      }
      
      if (hoveredNode) {
        // Обновляем содержимое подсказки
        const titleElement = tooltip.firstChild;
        titleElement.textContent = hoveredNode.title;
        
        const descriptionElement = tooltip.lastChild;
        if (hoveredNode.description) {
          descriptionElement.textContent = hoveredNode.description;
          descriptionElement.style.display = 'block';
        } else {
          descriptionElement.style.display = 'none';
        }
        
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
      // Используем такой же множитель для обнаружения как и при наведении
      const detectionMultiplier = 10 / nodeRadius;
      
      for (let node of nodes) {
        const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
        if (distance <= node.radius * Math.min(3, detectionMultiplier)) {
          navigate(`/skills/${node.id}`);
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
  }, [filteredSkills, navigate]);

  return (
    <div className="neuron-map-container" ref={containerRef}>
      <canvas ref={canvasRef} className="neuron-map-canvas"></canvas>
      
      {!filteredSkills.length && (
        <div className="no-skills-message">
          <p>Нет навыков для отображения</p>
        </div>
      )}
    </div>
  );
};

export default NeuronSkillsMap;