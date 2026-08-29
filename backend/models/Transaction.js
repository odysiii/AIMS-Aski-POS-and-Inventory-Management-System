// models/Transaction.js
const { ProductModel, prisma } = require('./Product');

const TransactionModel = {
  // Fetch all transactions with items and cashier details
  findAll: async () => {
    return await prisma.transaction.findMany({
      include: {
        items: true,
        cashier: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Process checkout, update stock, and emit real-time socket event
  createCheckout: async (payload, io) => {
    const { items, subtotal, discountPercent, discountAmount, totalAmount, paymentMethod, cashierId } = payload;

    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction and line items
      const newTx = await tx.transaction.create({
        data: {
          transactionNo: `TXN-${Date.now()}`,
          subtotal,
          discountPercent: discountPercent || 0,
          discountAmount: discountAmount || 0,
          totalAmount,
          paymentMethod,
          cashierId: Number(cashierId) || 1, // Ensured Int type matching schema
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
        include: {
          items: true,
          cashier: { select: { username: true } }
        },
      });

      // 2. Decrement product stock in PostgreSQL
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newTx;
    });

    if (io) {
      io.emit('transaction_created', transaction);
    }

    return transaction;
  },
};

module.exports = TransactionModel;