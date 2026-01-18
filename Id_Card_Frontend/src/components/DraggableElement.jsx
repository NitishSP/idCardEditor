import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

const DraggableElement = ({ children, position, onDrag, bounds = 'parent', disabled = false, onSelect, zIndex = 0, opacity = 1 }) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState(position);

  useEffect(() => {
    setCurrentPos(position);
  }, [position]);

  const handleMouseDown = useCallback((e) => {
    if (disabled) return;
    
    e.stopPropagation(); // Prevent canvas deselect
    e.preventDefault(); // Prevent text selection
    onSelect?.();
    
    const canvas = elementRef.current?.offsetParent;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - canvasRect.left - currentPos.x,
      y: e.clientY - canvasRect.top - currentPos.y,
    });
  }, [disabled, onSelect, currentPos]);

  const handleClick = useCallback((e) => {
    e.stopPropagation(); // Prevent canvas deselect when clicking element
    onSelect?.();
  }, [onSelect]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const canvas = elementRef.current?.offsetParent;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      
      let newX = e.clientX - canvasRect.left - dragStart.x;
      let newY = e.clientY - canvasRect.top - dragStart.y;

      // Apply bounds if parent
      if (bounds === 'parent' && elementRef.current) {
        const elementRect = elementRef.current.getBoundingClientRect();
        const elementWidth = elementRect.width;
        const elementHeight = elementRect.height;
        
        newX = Math.max(0, Math.min(newX, canvasRect.width - elementWidth));
        newY = Math.max(0, Math.min(newY, canvasRect.height - elementHeight));
      }

      setCurrentPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDrag?.(null, { x: currentPos.x, y: currentPos.y });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, currentPos, onDrag, bounds]);

  const elementStyle = useMemo(() => ({
    position: 'absolute',
    left: `${currentPos.x}px`,
    top: `${currentPos.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    transition: isDragging ? 'none' : 'all 0.1s ease-out',
    zIndex: zIndex,
    opacity: opacity,
  }), [currentPos, isDragging, zIndex, opacity]);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={elementStyle}
      role="button"
      tabIndex={0}
      aria-label="Draggable element"
    >
      {children}
    </div>
  );
};

export default DraggableElement;
