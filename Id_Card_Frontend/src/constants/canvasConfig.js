// Standard ID card size configuration (CR80 standard)
// Using centralized conversion utilities
import { mmToPx, DEFAULT_CARD_SIZE } from '../utils/cardSizeUtils';

export const CANVAS_CONFIG = {
  WIDTH: mmToPx(DEFAULT_CARD_SIZE.widthMm),
  HEIGHT: mmToPx(DEFAULT_CARD_SIZE.heightMm),
  ORIENTATION: 'landscape',
};

export const CANVAS_DEFAULTS = {
  backgroundColor: '#ffffff',
  backgroundOpacity: 1,
  backgroundImage: null,
  zoom: 125,
  showGrid: false,
  snapToGrid: false,
  gridSize: 10,
  borderStyle: 'none',
  borderWidth: 1,
  borderColor: '#000000',
  borderSides: '',
};
