// Print utilities constants

export const pxToMm = (pixels) => (pixels * 25.4) / 96;

export const mmToPx = (mm) => (mm * 96) / 25.4;

export const PAPER_SIZES = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  LETTER: { width: 215.9, height: 279.4 },
};

export const ID_CARD_SIZE = {
  width: 85.6,
  height: 53.98,
  widthPx: 323,
  heightPx: 204,
};
