/**
 * Placeholder datasets for the Demand Forecast screen.
 *
 * The real numbers come from the Python forecasting service, which does not
 * exist yet. Once it lands, replace these imports with a fetch to
 *   GET /api/forecast/current
 *   GET /api/forecast/future
 * See BACKEND-HANDOFF.md item #7.
 */

export const currentData = {
  transactionHours: [
    { hour: '8', dark: 10, light: 5 },
    { hour: '9', dark: 30, light: 10 },
    { hour: '10', dark: 33, light: 22 },
    { hour: '11', dark: 38, light: 15 },
    { hour: '12', dark: 45, light: 33 },
    { hour: '1', dark: 50, light: 18 },
    { hour: '2', dark: 53, light: 23 },
    { hour: '3', dark: 60, light: 31 },
    { hour: '4', dark: 63, light: 16 },
    { hour: '5', dark: 70, light: 16 },
    { hour: '6', dark: 62, light: 17 },
  ],
  revenueTrend: [
    { name: 'P1', line1: 85, line2: 55, line3: 50 },
    { name: 'P2', line1: 72, line2: 23, line3: 70 },
    { name: 'P3', line1: 67, line2: 60, line3: 65 },
    { name: 'P4', line1: 40, line2: 95, line3: 92 },
    { name: 'P5', line1: 60, line2: 32, line3: 88 },
    { name: 'P6', line1: 35, line2: 55, line3: 33 },
    { name: 'P7', line1: 68, line2: 83, line3: 25 },
    { name: 'P8', line1: 75, line2: 18, line3: 95 },
    { name: 'P9', line1: 22, line2: 25, line3: 15 },
    { name: 'P10', line1: 85, line2: 50, line3: 78 },
    { name: 'P11', line1: 20, line2: 40, line3: 96 },
    { name: 'P12', line1: 78, line2: 76, line3: 45 },
  ],
  categorySales: [
    { category: 'C1', sales: 430 },
    { category: 'C2', sales: 800 },
    { category: 'C3', sales: 480 },
    { category: 'C4', sales: 580 },
    { category: 'C5', sales: 390 },
  ],
  topSpecificItems: [
    { category: 'C1', seg1: 800, seg2: 700, seg3: 400 },
    { category: 'C2', seg1: 520, seg2: 780, seg3: 440 },
    { category: 'C3', seg1: 600, seg2: 770, seg3: 500 },
    { category: 'C4', seg1: 620, seg2: 640, seg3: 390 },
    { category: 'C5', seg1: 700, seg2: 710, seg3: 390 },
  ],
};

export const futureData = {
  transactionHours: [
    { hour: '8', dark: 15, light: 8 },
    { hour: '9', dark: 42, light: 15 },
    { hour: '10', dark: 50, light: 30 },
    { hour: '11', dark: 58, light: 25 },
    { hour: '12', dark: 65, light: 42 },
    { hour: '1', dark: 72, light: 28 },
    { hour: '2', dark: 78, light: 35 },
    { hour: '3', dark: 85, light: 40 },
    { hour: '4', dark: 90, light: 22 },
    { hour: '5', dark: 95, light: 25 },
    { hour: '6', dark: 80, light: 20 },
  ],
  revenueTrend: [
    { name: 'P1', line1: 90, line2: 60, line3: 55 },
    { name: 'P2', line1: 80, line2: 30, line3: 75 },
    { name: 'P3', line1: 75, line2: 68, line3: 70 },
    { name: 'P4', line1: 50, line2: 100, line3: 98 },
    { name: 'P5', line1: 68, line2: 40, line3: 92 },
    { name: 'P6', line1: 42, line2: 62, line3: 40 },
    { name: 'P7', line1: 75, line2: 88, line3: 30 },
    { name: 'P8', line1: 82, line2: 25, line3: 100 },
    { name: 'P9', line1: 30, line2: 32, line3: 20 },
    { name: 'P10', line1: 92, line2: 58, line3: 85 },
    { name: 'P11', line1: 28, line2: 48, line3: 99 },
    { name: 'P12', line1: 85, line2: 82, line3: 50 },
  ],
  categorySales: [
    { category: 'C1', sales: 550 },
    { category: 'C2', sales: 950 },
    { category: 'C3', sales: 610 },
    { category: 'C4', sales: 720 },
    { category: 'C5', sales: 500 },
  ],
  topSpecificItems: [
    { category: 'C1', seg1: 900, seg2: 800, seg3: 480 },
    { category: 'C2', seg1: 600, seg2: 850, seg3: 520 },
    { category: 'C3', seg1: 700, seg2: 820, seg3: 580 },
    { category: 'C4', seg1: 710, seg2: 730, seg3: 450 },
    { category: 'C5', seg1: 800, seg2: 790, seg3: 460 },
  ],
};
