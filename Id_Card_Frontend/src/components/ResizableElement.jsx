import React, { useRef, useState, useEffect, useCallback } from 'react';

const ResizableElement = ({ 
  children, 
  position, 
  size,
  onDrag, 
  onResize,
  bounds = 'parent', 
  disabled = false, 
  onSelect,
  isSelected,
  zIndex = 0,
  opacity = 1,
  minWidth = 10,
  minHeight = 10
}) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState(position);
  const [currentSize, setCurrentSize] = useState(size);

  useEffect(() => {
    setCurrentPos(position);
  }, [position]);

  useEffect(() => {
    setCurrentSize(size);
  }, [size]);

  const handleMouseDown = useCallback((e) => {
    if (disabled || e.target.classList.contains('resize-handle')) return;
    
    e.stopPropagation();
    e.preventDefault();
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

  const handleResizeMouseDown = useCallback((e, handle) => {
    if (disabled) return;
    
    e.stopPropagation();
    e.preventDefault();
    onSelect?.();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      width: currentSize.width,
      height: currentSize.height,
      posX: currentPos.x,
      posY: currentPos.y,
    });
  }, [disabled, onSelect, currentSize, currentPos]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect?.();
  }, [onSelect]);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      const canvas = elementRef.current?.offsetParent;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();

      if (isDragging) {
        let newX = e.clientX - canvasRect.left - dragStart.x;
        let newY = e.clientY - canvasRect.top - dragStart.y;

        if (bounds === 'parent') {
          const elementRect = elementRef.current.getBoundingClientRect();
          const elementWidth = elementRect.width;
          const elementHeight = elementRect.height;
          
          newX = Math.max(0, Math.min(newX, canvasRect.width - elementWidth));
          newY = Math.max(0, Math.min(newY, canvasRect.height - elementHeight));
        }

        setCurrentPos({ x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newWidth = dragStart.width;
        let newHeight = dragStart.height;
        let newX = dragStart.posX;
        let newY = dragStart.posY;

        switch (resizeHandle) {
          case 'se': // Bottom-right
            newWidth = Math.max(minWidth, dragStart.width + deltaX);
            newHeight = Math.max(minHeight, dragStart.height + deltaY);
            break;
          case 'sw': // Bottom-left
            newWidth = Math.max(minWidth, dragStart.width - deltaX);
            newHeight = Math.max(minHeight, dragStart.height + deltaY);
            if (newWidth > minWidth) newX = dragStart.posX + deltaX;
            break;
          case 'ne': // Top-right
            newWidth = Math.max(minWidth, dragStart.width + deltaX);
            newHeight = Math.max(minHeight, dragStart.height - deltaY);
            if (newHeight > minHeight) newY = dragStart.posY + deltaY;
            break;
          case 'nw': // Top-left
            newWidth = Math.max(minWidth, dragStart.width - deltaX);
            newHeight = Math.max(minHeight, dragStart.height - deltaY);
            if (newWidth > minWidth) newX = dragStart.posX + deltaX;
            if (newHeight > minHeight) newY = dragStart.posY + deltaY;
            break;
          case 'e': // Right
            newWidth = Math.max(minWidth, dragStart.width + deltaX);
            break;
          case 'w': // Left
            newWidth = Math.max(minWidth, dragStart.width - deltaX);
            if (newWidth > minWidth) newX = dragStart.posX + deltaX;
            break;
          case 's': // Bottom
            newHeight = Math.max(minHeight, dragStart.height + deltaY);
            break;
          case 'n': // Top
            newHeight = Math.max(minHeight, dragStart.height - deltaY);
            if (newHeight > minHeight) newY = dragStart.posY + deltaY;
            break;
        }

        // Apply bounds
        if (bounds === 'parent') {
          if (newX + newWidth > canvasRect.width) {
            newWidth = canvasRect.width - newX;
          }
          if (newY + newHeight > canvasRect.height) {
            newHeight = canvasRect.height - newY;
          }
          newX = Math.max(0, newX);
          newY = Math.max(0, newY);
        }

        setCurrentSize({ width: newWidth, height: newHeight });
        setCurrentPos({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onDrag?.(null, { x: currentPos.x, y: currentPos.y });
      } else if (isResizing) {
        setIsResizing(false);
        onResize?.({ 
          width: currentSize.width, 
          height: currentSize.height,
          x: currentPos.x,
          y: currentPos.y
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, currentPos, currentSize, onDrag, onResize, bounds, resizeHandle, minWidth, minHeight]);

  const elementStyle = {
    position: 'absolute',
    left: `${currentPos.x}px`,
    top: `${currentPos.y}px`,
    width: size ? `${currentSize.width}px` : 'auto',
    height: size ? `${currentSize.height}px` : 'auto',
    cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'grab',
    userSelect: 'none',
    transition: (isDragging || isResizing) ? 'none' : 'all 0.1s ease-out',
    zIndex: zIndex,
    opacity: opacity,
  };

  const resizeHandleStyle = {
    position: 'absolute',
    backgroundColor: '#3b82f6',
    border: '2px solid white',
    borderRadius: '50%',
    width: '10px',
    height: '10px',
    zIndex: 10,
  };

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={elementStyle}
      role="button"
      tabIndex={0}
      aria-label="Resizable element"
    >
      {children}
      
      {/* Resize handles - only show when selected and size is provided */}
      {isSelected && size && (
        <>
          {/* Corner handles */}
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            style={{ ...resizeHandleStyle, top: '-5px', left: '-5px', cursor: 'nw-resize' }}
          />
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            style={{ ...resizeHandleStyle, top: '-5px', right: '-5px', cursor: 'ne-resize' }}
          />
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            style={{ ...resizeHandleStyle, bottom: '-5px', left: '-5px', cursor: 'sw-resize' }}
          />
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            style={{ ...resizeHandleStyle, bottom: '-5px', right: '-5px', cursor: 'se-resize' }}
          />
          
          {/* Side handles */}
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
            style={{ ...resizeHandleStyle, top: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }}
          />
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
            style={{ ...resizeHandleStyle, bottom: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }}
          />
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
            style={{ ...resizeHandleStyle, top: '50%', left: '-5px', transform: 'translateY(-50%)', cursor: 'w-resize' }}
          />
          <div
            className="resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
            style={{ ...resizeHandleStyle, top: '50%', right: '-5px', transform: 'translateY(-50%)', cursor: 'e-resize' }}
          />
        </>
      )}
    </div>
  );
};

export default ResizableElement;
