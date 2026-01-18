

// Standard DPI for screen display (96 DPI)
const DPI = 96;
const MM_PER_INCH = 25.4;


export const MM_TO_PX = DPI / MM_PER_INCH;


export const mmToPx = (mm) => Math.round(mm * MM_TO_PX);

export const pxToMm = (px) => Math.round((px / MM_TO_PX) * 10) / 10;

/**
 * Standard card sizes in millimeters
 */
export const CARD_SIZES = {
  CR80: {
    name: 'CR80 (ISO 7810 ID-1)',
    width: 85.6,
    height: 54,
    description: 'Standard credit card size',
  },
  CR79: {
    name: 'CR79',
    width: 79.9,
    height: 50,
    description: 'Slightly smaller than CR80',
  },
};

/**
 * Default card size (CR80)
 */
export const DEFAULT_CARD_SIZE = {
  widthMm: CARD_SIZES.CR80.width,
  heightMm: CARD_SIZES.CR80.height,
};

export default {
  MM_TO_PX,
  mmToPx,
  pxToMm,
  CARD_SIZES,
  DEFAULT_CARD_SIZE,
};
