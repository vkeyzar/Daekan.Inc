/**
 * Helper to calculate dynamic column spans in a 6-column CSS grid.
 * - Standard desktop (lg): 3 columns (col-span-2 each, 33.33%)
 * - Auto-adjust remainder on last row:
 *   - 2 items remaining: span 3 columns each (50% each, terbagi 2 merata, full wide)
 *   - 1 item remaining: spans all 6 columns (100% full wide)
 * - Tablet (md): 2 columns (col-span-3 each), 1 remainder spans full width (col-span-6)
 * - Mobile (< md): 2 columns (col-span-3 each) or full width (col-span-6)
 */
export const getProductColSpan = (index: number, total: number): string => {
  if (total <= 0) return 'col-span-6';

  // Mobile (< md)
  let mobileSpan = 'col-span-3';
  if (total <= 2) {
    mobileSpan = 'col-span-6';
  } else if (total % 2 === 1 && index === total - 1) {
    mobileSpan = 'col-span-6';
  }

  // Tablet (md: 768px - 1023px)
  let mdSpan = 'md:col-span-3';
  if (total === 1) {
    mdSpan = 'md:col-span-6';
  } else if (total % 2 === 1 && index === total - 1) {
    mdSpan = 'md:col-span-6';
  }

  // Desktop (lg: >= 1024px)
  let lgSpan = 'lg:col-span-2';
  const lgRemainder = total % 3;
  if (lgRemainder === 1 && index === total - 1) {
    lgSpan = 'lg:col-span-6'; // 1 item tersisa -> full width
  } else if (lgRemainder === 2 && index >= total - 2) {
    lgSpan = 'lg:col-span-3'; // 2 item tersisa -> terbagi 2 merata, full width
  }

  return `${mobileSpan} ${mdSpan} ${lgSpan}`;
};

/**
 * Helper to calculate dynamic aspect ratio for cards so vertical height remains
 * identical to a standard 3-column row, while horizontal width extends to full wide.
 * - Standard 3-col item: width = 33.33%, height = 33.33% -> aspect-square (1:1)
 * - 2 items remaining: width = 50%, height = 33.33% -> aspect-[3/2] (1.5:1)
 * - 1 item remaining: width = 100%, height = 33.33% -> aspect-[3/1] (3:1)
 */
export const getProductAspectRatio = (index: number, total: number): string => {
  if (total <= 0) return 'aspect-square';

  // Mobile (< md): standard is 2 cols (square), 1 item remaining is 100% wide (aspect-[2/1])
  let mobileAspect = 'aspect-square';
  if (total <= 2) {
    mobileAspect = 'aspect-[2/1]';
  } else if (total % 2 === 1 && index === total - 1) {
    mobileAspect = 'aspect-[2/1]';
  }

  // Tablet (md: 768px - 1023px): standard is 2 cols
  let mdAspect = 'md:aspect-square';
  if (total === 1) {
    mdAspect = 'md:aspect-[2/1]';
  } else if (total % 2 === 1 && index === total - 1) {
    mdAspect = 'md:aspect-[2/1]';
  }

  // Desktop (lg: >= 1024px): standard is 3 cols
  let lgAspect = 'lg:aspect-square';
  const lgRemainder = total % 3;
  if (lgRemainder === 1 && index === total - 1) {
    lgAspect = 'lg:aspect-[3/1]'; // 1 item: horizontal 3x, vertical sama seperti 3 product
  } else if (lgRemainder === 2 && index >= total - 2) {
    lgAspect = 'lg:aspect-[3/2]'; // 2 item: horizontal 1.5x (50%), vertical sama seperti 3 product
  }

  return `${mobileAspect} ${mdAspect} ${lgAspect}`;
};
