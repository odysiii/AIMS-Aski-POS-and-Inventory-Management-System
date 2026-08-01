// models/Transaction.js
const { ProductModel, prisma } = require('./Product');

const TransactionModel = {
  // Fetch all transactions with items
  findAll: async () => {
    return await prisma.transaction.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Process checkout transaction & update stock inside a Prisma $transaction
  createCheckout: async (payload) => {
    const { items, subtotal, discountPercent, discountAmount, totalAmount, paymentMethod, cashierId } = payload;

    return await prisma.$transaction(async (tx) => {
      // 1. Create Transaction and line items
      const transaction = await tx.transaction.create({
        data: {
          transactionNo: `TXN-${Date.now()}`,
          subtotal,
          discountPercent: discountPercent || 0,
          discountAmount: discountAmount || 0,
          totalAmount,
          paymentMethod,
          cashierId: cashierId || 'CASHIER-1',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.unitPrice * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Decrement product stock in PostgreSQL
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return transaction;
    });
  },
};

module.exports = TransactionModel;