import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NeuronSkillsMap = ({ skills, activeCategory }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const animationRef = useRef(null);

  // Фильтрация навыков в зависимости от выбранной категории
  const filteredSkills = activeCategory === 'all'
    ? skills
    : skills.filter(skill => skill.category === activeCategory);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !filteredSkills.length) return;

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

    // Создаем узлы для навыков
    const nodes = filteredSkills.map((skill, index) => {
      // Создаем случайное распределение узлов внутри контура мозга
      // Большая часть узлов будет сосредоточена в верхней части
      const x = getRandomNumber(canvas.width * 0.1, canvas.width * 0.9);
      const y = getRandomNumber(canvas.height * 0.2, canvas.height * 0.8);
      
      // Создаем случайное движение для анимации
      const vx = getRandomNumber(-0.1, 0.1);
      const vy = getRandomNumber(-0.1, 0.1);
      
      // Используем цвет навыка или случайный цвет
      const color = skill.color || `hsl(${getRandomNumber(0, 360)}, 70%, 60%)`;
      
      return {
        id: skill.id,
        x,
        y,
        vx,
        vy,
        radius: 8, // Размер узла
        color,
        title: skill.article,
        description: skill.description || '',
        category: skill.category,
        connections: [] // Связи с другими узлами
      };
    });

    // Создаем связи между узлами одной категории
    const categoryMap = {};
    
    nodes.forEach(node => {
      if (!categoryMap[node.category]) {
        categoryMap[node.category] = [];
      }
      categoryMap[node.category].push(node);
    });
    
    // Для каждой категории создаем связи между узлами
    Object.values(categoryMap).forEach(categoryNodes => {
      categoryNodes.forEach(node => {
        // Соединяем каждый узел с 2-3 случайными узлами из той же категории
        const nodesToConnect = Math.min(
          categoryNodes.length - 1, 
          Math.floor(getRandomNumber(2, 4))
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

    // Анимация и отрисовка
    const draw = () => {
      // Очищаем канвас
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Рисуем контур мозга в фоне
      drawBrainOutline(ctx, canvas.width, canvas.height);
      
      // Рисуем связи между узлами
      ctx.lineWidth = 0.5;
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
        const padding = 30;
        if (node.x < padding || node.x > canvas.width - padding) {
          node.vx = -node.vx;
          node.x = Math.max(padding, Math.min(node.x, canvas.width - padding));
        }
        if (node.y < padding || node.y > canvas.height - padding) {
          node.vy = -node.vy;
          node.y = Math.max(padding, Math.min(node.y, canvas.height - padding));
        }
        
        // Рисуем свечение узла
        const glow = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 3
        );
        glow.addColorStop(0, node.color);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Рисуем сам узел
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Запускаем следующий кадр анимации
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Функция для отрисовки контура мозга
    const drawBrainOutline = (ctx, width, height) => {
      ctx.save();
      
      // Устанавливаем полупрозрачный серый цвет для контура
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 2;
      
      // Масштабируем контур в зависимости от размеров канваса
      const scale = Math.min(width / 800, height / 600);
      
      // Центрируем контур
      const centerX = width / 2;
      const centerY = height / 2;
      
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      
      // Рисуем контур мозга (простая аппроксимация)
      ctx.beginPath();
      
      // Левая часть мозга
      ctx.moveTo(-160, -110);
      ctx.bezierCurveTo(-200, -150, -220, -80, -240, -30);
      ctx.bezierCurveTo(-260, 40, -220, 120, -160, 140);
      ctx.bezierCurveTo(-100, 160, -50, 120, -30, 80);
      
      // Правая часть мозга
      ctx.moveTo(160, -110);
      ctx.bezierCurveTo(200, -150, 220, -80, 240, -30);
      ctx.bezierCurveTo(260, 40, 220, 120, 160, 140);
      ctx.bezierCurveTo(100, 160, 50, 120, 30, 80);
      
      // Верхняя часть мозга
      ctx.moveTo(-160, -110);
      ctx.bezierCurveTo(-120, -130, -60, -150, 0, -150);
      ctx.bezierCurveTo(60, -150, 120, -130, 160, -110);
      
      // Нижняя часть мозга и мозжечок
      ctx.moveTo(-30, 80);
      ctx.bezierCurveTo(-20, 100, 20, 100, 30, 80);
      
      // Мозжечок (дополнительные детали)
      ctx.moveTo(-80, 120);
      ctx.bezierCurveTo(-50, 140, 50, 140, 80, 120);
      
      ctx.stroke();
      ctx.restore();
    };

    // Добавляем обработчик клика
    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Проверяем, попал ли клик в какой-либо узел
      for (let node of nodes) {
        const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
        if (distance <= node.radius * 2) {
          // Переходим на страницу выбранного навыка
          navigate(`/skills/${node.id}`);
          break;
        }
      }
    };
    
    canvas.addEventListener('click', handleCanvasClick);
    
    // Запускаем анимацию
    draw();
    
    // Очищаем ресурсы при размонтировании
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [filteredSkills, navigate, activeCategory]);

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