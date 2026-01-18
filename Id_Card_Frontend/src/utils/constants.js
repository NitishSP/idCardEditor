// Card dimensions - using centralized utilities
import { mmToPx, DEFAULT_CARD_SIZE } from './cardSizeUtils';

export const cardSizes = {
  width: mmToPx(DEFAULT_CARD_SIZE.widthMm),
  height: mmToPx(DEFAULT_CARD_SIZE.heightMm),
};
