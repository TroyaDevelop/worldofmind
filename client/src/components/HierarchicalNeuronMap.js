import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HierarchicalNeuronMap = ({ skills, categories, activeCategory }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const animationRef = useRef(null);
  const nodesRef = useRef([]);
  const tooltipRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);

  // Фильтрация навыков в зависимости от выбранной категории
  const filteredSkills = useMemo(() => {
    if (activeCategory === 'all') return skills;
    if (activeCategory.startsWith('category_')) {
      const categoryId = parseInt(activeCategory.replace('category_', ''));
      return skills.filter(skill => skill.category_id === categoryId);
    }
    if (activeCategory.startsWith('subcategory_')) {
      const subcategoryId = parseInt(activeCategory.replace('subcategory_', ''));
      return skills.filter(skill => skill.subcategory_id === subcategoryId);
    }
    return skills.filter(skill => skill.category === activeCategory);
  }, [skills, activeCategory]);

  // Группировка навыков по категориям и подкатегориям
  const groupedData = useMemo(() => {
    const groups = {
      categories: {},
      subcategories: {},
      skills: filteredSkills
    };

    // Группируем категории
    categories.forEach(category => {
      groups.categories[category.id] = {
        ...category,
        skills: filteredSkills.filter(skill => skill.category_id === category.id),
        subcategories: category.subcategories || []
      };
    });

    // Группируем подкатегории
    categories.forEach(category => {
      (category.subcategories || []).forEach(subcategory => {
        groups.subcategories[subcategory.id] = {
          ...subcategory,
          skills: filteredSkills.filter(skill => skill.subcategory_id === subcategory.id),
          category: category
        };
      });
    });

    return groups;
  }, [filteredSkills, categories]);

  // Расчет позиций для иерархической структуры
  const calculateHierarchicalPositions = (canvas) => {
    const nodes = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const categoryRadius = Math.min(canvas.width, canvas.height) * 0.3;
    const subcategoryRadius = categoryRadius * 0.6;
    const skillRadius = subcategoryRadius * 0.4;

    // Создаем узлы категорий по кругу
    const categoryNodes = Object.values(groupedData.categories).map((category, index) => {
      const angle = (index / Object.keys(groupedData.categories).length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * categoryRadius;
      const y = centerY + Math.sin(angle) * categoryRadius;
      
      return {
        id: `category_${category.id}`,
        type: 'category',
        x: category.position_x || x,
        y: category.position_y || y,
        radius: 20,
        color: category.color || '#3498db',
        title: category.name,
        description: category.description || '',
        data: category,
        connections: []
      };
    });

    // Создаем узлы подкатегорий вокруг родительских категорий
    const subcategoryNodes = [];
    Object.values(groupedData.subcategories).forEach(subcategory => {
      const parentCategory = categoryNodes.find(node => node.data.id === subcategory.category.id);
      if (parentCategory) {
        const subcategoriesInCategory = Object.values(groupedData.subcategories)
          .filter(sub => sub.category.id === subcategory.category.id);
        const index = subcategoriesInCategory.findIndex(sub => sub.id === subcategory.id);
        const angle = (index / subcategoriesInCategory.length) * 2 * Math.PI;
        
        const x = parentCategory.x + Math.cos(angle) * subcategoryRadius;
        const y = parentCategory.y + Math.sin(angle) * subcategoryRadius;
        
        const node = {
          id: `subcategory_${subcategory.id}`,
          type: 'subcategory',
          x: subcategory.position_x || x,
          y: subcategory.position_y || y,
          radius: 15,
          color: subcategory.color || '#2ecc71',
          title: subcategory.name,
          description: subcategory.description || '',
          data: subcategory,
          connections: [parentCategory.id]
        };
        
        subcategoryNodes.push(node);
        parentCategory.connections.push(node.id);
      }
    });

    // Создаем узлы навыков вокруг подкатегорий или категорий
    const skillNodes = filteredSkills.map(skill => {
      let parentNode = null;
      
      if (skill.subcategory_id) {
        parentNode = subcategoryNodes.find(node => node.data.id === skill.subcategory_id);
      } else if (skill.category_id) {
        parentNode = categoryNodes.find(node => node.data.id === skill.category_id);
      }
      
      let x, y;
      if (parentNode) {
        const skillsForParent = filteredSkills.filter(s => 
          s.subcategory_id === skill.subcategory_id && s.category_id === skill.category_id
        );
        const index = skillsForParent.findIndex(s => s.id === skill.id);
        const angle = (index / skillsForParent.length) * 2 * Math.PI;
        
        x = parentNode.x + Math.cos(angle) * skillRadius;
        y = parentNode.y + Math.sin(angle) * skillRadius;
      } else {
        // Случайное размещение для навыков без категории
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
      }
      
      const node = {
        id: `skill_${skill.id}`,
        type: 'skill',
        x: skill.position_x || x,
        y: skill.position_y || y,
        radius: 8,
        color: skill.color || '#e74c3c',
        title: skill.article,
        description: skill.description || '',
        data: skill,
        connections: parentNode ? [parentNode.id] : []
      };
      
      if (parentNode) {
        parentNode.connections.push(node.id);
      }
      
      return node;
    });

    return [...categoryNodes, ...subcategoryNodes, ...skillNodes];
  };

  // Инициализация анимации
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;

    // Устанавливаем размеры канваса
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = Math.max(600, container.clientHeight);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Создаем узлы
    const nodes = calculateHierarchicalPositions(canvas);
    nodesRef.current = nodes;

    // Функция отрисовки
    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем фоновые эффекты
      drawBackground(ctx, canvas);
      
      // Рисуем связи
      drawConnections(ctx, nodes);
      
      // Рисуем узлы
      drawNodes(ctx, nodes);
      
      animationRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    // Обработчики событий мыши
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      if (isDragging && dragNode) {
        dragNode.x = mouseX;
        dragNode.y = mouseY;
        return;
      }
      
      // Показываем тултип
      const hoveredNode = nodes.find(node => {
        const dist = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
        return dist <= node.radius;
      });
      
      showTooltip(hoveredNode, mouseX, mouseY);
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const clickedNode = nodes.find(node => {
        const dist = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
        return dist <= node.radius;
      });
      
      if (clickedNode) {
        setIsDragging(true);
        setDragNode(clickedNode);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragNode(null);
    };

    const handleClick = (e) => {
      if (isDragging) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const clickedNode = nodes.find(node => {
        const dist = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
        return dist <= node.radius;
      });
      
      if (clickedNode && clickedNode.type === 'skill') {
        navigate(`/skill/${clickedNode.data.id}`);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
    };
  }, [groupedData, navigate, isDragging, dragNode]);

  // Функция отрисовки фона
  const drawBackground = (ctx, canvas) => {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, 'rgba(20, 20, 40, 0.8)');
    gradient.addColorStop(1, 'rgba(10, 10, 20, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Функция отрисовки связей
  const drawConnections = (ctx, nodes) => {
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
    ctx.lineWidth = 1;
    
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId);
        if (connectedNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connectedNode.x, connectedNode.y);
          ctx.stroke();
        }
      });
    });
  };

  // Функция отрисовки узлов
  const drawNodes = (ctx, nodes) => {
    nodes.forEach(node => {
      // Тень
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Основной круг
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      
      // Обводка
      ctx.strokeStyle = node.type === 'category' ? '#fff' : 
                       node.type === 'subcategory' ? '#ddd' : '#ccc';
      ctx.lineWidth = node.type === 'category' ? 3 : 
                     node.type === 'subcategory' ? 2 : 1;
      ctx.stroke();
      
      // Сброс тени
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Иконка или текст в зависимости от типа
      if (node.type === 'category') {
        drawCategoryIcon(ctx, node);
      } else if (node.type === 'subcategory') {
        drawSubcategoryIcon(ctx, node);
      } else {
        drawSkillIcon(ctx, node);
      }
    });
  };

  // Функция отрисовки иконки категории
  const drawCategoryIcon = (ctx, node) => {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📁', node.x, node.y);
  };

  // Функция отрисовки иконки подкатегории
  const drawSubcategoryIcon = (ctx, node) => {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📂', node.x, node.y);
  };

  // Функция отрисовки иконки навыка
  const drawSkillIcon = (ctx, node) => {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', node.x, node.y);
  };

  // Функция показа тултипа
  const showTooltip = (node, mouseX, mouseY) => {
    if (tooltipRef.current) {
      document.body.removeChild(tooltipRef.current);
      tooltipRef.current = null;
    }
    
    if (node) {
      const tooltip = document.createElement('div');
      tooltip.style.position = 'absolute';
      tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '8px 12px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '12px';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.zIndex = '1000';
      tooltip.style.maxWidth = '200px';
      
      const rect = canvasRef.current.getBoundingClientRect();
      tooltip.style.left = `${rect.left + mouseX + 10}px`;
      tooltip.style.top = `${rect.top + mouseY - 10}px`;
      
      tooltip.innerHTML = `
        <div style="font-weight: bold;">${node.title}</div>
        ${node.description ? `<div style="margin-top: 4px; opacity: 0.8;">${node.description}</div>` : ''}
        <div style="margin-top: 4px; opacity: 0.6; font-size: 10px;">
          ${node.type === 'category' ? 'Категория' : 
            node.type === 'subcategory' ? 'Подкатегория' : 'Навык'}
        </div>
      `;
      
      document.body.appendChild(tooltip);
      tooltipRef.current = tooltip;
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas 
        ref={canvasRef}
        style={{ 
          display: 'block', 
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
        }}
      />
    </div>
  );
};

export default HierarchicalNeuronMap;
