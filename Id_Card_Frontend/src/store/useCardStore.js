import { create } from 'zustand';
import { CANVAS_DEFAULTS } from '../constants/canvasConfig';
import { DEFAULT_CARD_SIZE, mmToPx } from '../utils/cardSizeUtils';

const useCardStore = create((set, get) => ({
  // Canvas settings - Dimensions calculated from mm values
  canvas: {
    width: mmToPx(DEFAULT_CARD_SIZE.widthMm),   // Calculated from mm
    height: mmToPx(DEFAULT_CARD_SIZE.heightMm), // Calculated from mm
    orientation: 'landscape',
    cardWidthMm: DEFAULT_CARD_SIZE.widthMm,     // CR80: 85.6mm
    cardHeightMm: DEFAULT_CARD_SIZE.heightMm,   // CR80: 54mm
    ...CANVAS_DEFAULTS,
  },

  // Elements on the card (text fields, images, QR codes)
  elements: [],

  // Selected element ID
  selectedElementId: null,

  // Templates
  templates: [
    {
      id: 'template-1',
      name: 'Corporate Blue',
      preview: '/templates/corporate-blue.png',
      backgroundImage: '/templates/corporate-blue.png',
      orientation: 'landscape',
    },
    {
      id: 'template-2',
      name: 'Modern Gradient',
      preview: '/templates/modern-gradient.png',
      backgroundImage: '/templates/modern-gradient.png',
      orientation: 'landscape',
    },
  ],

  // Actions
  setCanvasProperty: (property, value) => set((state) => ({
    canvas: { ...state.canvas, [property]: value }
  })),

  toggleOrientation: () => set((state) => {
    const isLandscape = state.canvas.orientation === 'landscape';
    return {
      canvas: {
        ...state.canvas,
        orientation: isLandscape ? 'portrait' : 'landscape',
        width: state.canvas.height,
        height: state.canvas.width,
        cardWidthMm: state.canvas.cardHeightMm,
        cardHeightMm: state.canvas.cardWidthMm,
      }
    };
  }),

  addElement: (element) => set((state) => {
    // Calculate next z-index
    const maxZIndex = state.elements.length > 0 
      ? Math.max(...state.elements.map(el => el.zIndex || 0))
      : 0;
    
    return {
      elements: [...state.elements, { 
        ...element, 
        id: `${element.type}-${Date.now()}`,
        zIndex: element.zIndex !== undefined ? element.zIndex : maxZIndex + 1,
        opacity: element.opacity !== undefined ? element.opacity : 1
      }]
    };
  }),

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    )
  })),

  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter(el => el.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),

  selectElement: (id) => set({ selectedElementId: id }),

  deselectElement: () => set({ selectedElementId: null }),

  getSelectedElement: () => {
    const state = get();
    return state.elements.find(el => el.id === state.selectedElementId);
  },

  duplicateElement: (id) => set((state) => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return state;
    
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: element.x + 10,
      y: element.y + 10,
    };
    
    return { elements: [...state.elements, newElement] };
  }),

  moveElement: (id, x, y) => {
    const state = get();
    const { snapToGrid, gridSize } = state.canvas;
    
    let finalX = x;
    let finalY = y;
    
    if (snapToGrid) {
      finalX = Math.round(x / gridSize) * gridSize;
      finalY = Math.round(y / gridSize) * gridSize;
    }
    
    set((state) => ({
      elements: state.elements.map(el => 
        el.id === id ? { ...el, x: finalX, y: finalY } : el
      )
    }));
  },

  moveElementUp: (id) => set((state) => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return state;
    
    const currentZIndex = element.zIndex || 0;
    const elementsAbove = state.elements.filter(el => (el.zIndex || 0) > currentZIndex);
    
    if (elementsAbove.length === 0) return state; // Already at top
    
    const nextZIndex = Math.min(...elementsAbove.map(el => el.zIndex || 0));
    
    return {
      elements: state.elements.map(el => {
        if (el.id === id) return { ...el, zIndex: nextZIndex };
        if ((el.zIndex || 0) === nextZIndex) return { ...el, zIndex: currentZIndex };
        return el;
      })
    };
  }),

  moveElementDown: (id) => set((state) => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return state;
    
    const currentZIndex = element.zIndex || 0;
    const elementsBelow = state.elements.filter(el => (el.zIndex || 0) < currentZIndex);
    
    if (elementsBelow.length === 0) return state; // Already at bottom
    
    const prevZIndex = Math.max(...elementsBelow.map(el => el.zIndex || 0));
    
    return {
      elements: state.elements.map(el => {
        if (el.id === id) return { ...el, zIndex: prevZIndex };
        if ((el.zIndex || 0) === prevZIndex) return { ...el, zIndex: currentZIndex };
        return el;
      })
    };
  }),

  moveElementToFront: (id) => set((state) => {
    const maxZIndex = state.elements.length > 0 
      ? Math.max(...state.elements.map(el => el.zIndex || 0))
      : 0;
    
    return {
      elements: state.elements.map(el => 
        el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
      )
    };
  }),

  moveElementToBack: (id) => set((state) => {
    const minZIndex = state.elements.length > 0 
      ? Math.min(...state.elements.map(el => el.zIndex || 0))
      : 0;
    
    return {
      elements: state.elements.map(el => 
        el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
      )
    };
  }),

  setTemplate: (template) => set((state) => ({
    canvas: {
      ...state.canvas,
      backgroundImage: template.backgroundImage,
      orientation: template.orientation,
    }
  })),

  clearAllElements: () => set({ elements: [], selectedElementId: null }),

  exportData: () => {
    const state = get();
    return {
      canvas: state.canvas,
      elements: state.elements,
    };
  },

  importData: (data) => set({
    canvas: data.canvas || get().canvas,
    elements: data.elements || [],
    selectedElementId: null,
  }),

  // Validate QR elements have proper field selection (0-3 fields)
  validateQRElements: () => {
    const state = get();
    const qrElements = state.elements.filter(el => el.type === 'qr');
    
    if (qrElements.length === 0) return { isValid: true, message: '' };
    
    for (const qrEl of qrElements) {
      const fieldCount = (qrEl.qrFields || []).length;
      // Allow 0 fields, warn but don't block
      if (fieldCount > 3) {
        return {
          isValid: false,
          message: 'QR code can have maximum 3 fields selected'
        };
      }
    }
    
    return { isValid: true, message: '' };
  },
}));

export default useCardStore;
