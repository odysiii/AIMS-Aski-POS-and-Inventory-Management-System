const { prisma } = require('./Product'); // Reuse existing Prisma client instance

const ReconciliationModel = {
  // 1. Fetch all past reconciliations
  findAll: async () => {
    return await prisma.reconciliation.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  // 2. Calculate system expected cash for today's transactions
  getExpectedCashForToday: async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const aggregation = await prisma.transaction.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        paymentMethod: 'CASH',
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const total = aggregation._sum.totalAmount;
    return total ? parseFloat(total.toString()) : 0.0;
  },

  // 3. Save cash reconciliation record to PostgreSQL
  create: async (data) => {
    const {
      cashierId,
      countedCash,
      totalCountedCash,
      expectedCash,
      expectedSystemCash,
      variance,
      denominations = {},
      notes,
      status,
    } = data;

    // Resolve value fallbacks safely
    const finalCountedCash = parseFloat(totalCountedCash || countedCash) || 0;
    const finalExpectedCash = parseFloat(expectedSystemCash || expectedCash) || 0;

    return await prisma.reconciliation.create({
      data: {
        cashierId: cashierId || 'CASHIER-1',
        totalCountedCash: finalCountedCash,
        expectedSystemCash: finalExpectedCash,
        variance: parseFloat(variance) || 0,
        p1000: parseInt(denominations.p1000, 10) || 0,
        p500: parseInt(denominations.p500, 10) || 0,
        p200: parseInt(denominations.p200, 10) || 0,
        p100: parseInt(denominations.p100, 10) || 0,
        p50: parseInt(denominations.p50, 10) || 0,
        p20: parseInt(denominations.p20, 10) || 0,
        p10: parseInt(denominations.p10, 10) || 0,
        p5: parseInt(denominations.p5, 10) || 0,
        p1: parseInt(denominations.p1, 10) || 0,
        c25: parseInt(denominations.c25, 10) || 0,
        status: status || 'COMPLETED',
        notes: notes || 'End of Shift Audit',
      },
    });
  },
};

module.exports = ReconciliationModel;