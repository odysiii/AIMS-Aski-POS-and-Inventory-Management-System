const { ProductModel, prisma } = require('./Product');

const DashboardModel = {
    getTodayRevenue: async () => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const result = await prisma.transaction.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                createdAt: {
                    gte: startOfToday,
                },
            },
        });
        return result._sum.totalAmount || 0;
    },

    getLowStockCount: async (threshold = 10) => {
        return await prisma.product.count({
            where: {
                stock: {
                    lte: threshold,
                },
            },
        });
    },

    // models/Dashboard.js

    getDailySalesTrend: async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const rawData = await prisma.$queryRaw`
    SELECT 
      TO_CHAR("createdAt", 'Mon DD') AS day,
      SUM("totalAmount")::FLOAT AS sales
    FROM "Transaction"
    WHERE "createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("createdAt"), TO_CHAR("createdAt", 'Mon DD')
    ORDER BY DATE("createdAt") ASC;
  `;

        // Safely map values into standard JavaScript Primitives
        return rawData.map((row) => ({
            day: row.day,
            sales: Number(row.sales || 0),
        }));
    },

    getExpiryWatchList: async (daysThreshold = 30) => {
        const today = new Date();
        const futureThreshold = new Date();
        futureThreshold.setDate(today.getDate() + daysThreshold);

        const products = await prisma.product.findMany({
            where: {
                expiryDate: {
                    not: null,
                    lte: futureThreshold, // Fetch everything expiring on or before the threshold (including past dates)
                },
            },
            select: {
                id: true,
                name: true,
                expiryDate: true,
            },
            orderBy: {
                expiryDate: 'asc', // Keeps expired items at the top
            },
            take: 10,
        });

        return products.map((item) => {
            const expiry = new Date(item.expiryDate);
            const diffTime = expiry - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const isExpired = diffDays <= 0;

            return {
                id: item.id,
                product: item.name,
                expiryDate: item.expiryDate,
                days: diffDays, // Returns negative number if expired (e.g., -5 days ago)
                status: isExpired ? 'Expired' : 'Expiring Soon',
                formattedText: isExpired
                    ? `Expired (${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago)`
                    : `${diffDays} day${diffDays === 1 ? '' : 's'} left`,
            };
        });
    }
}

module.exports = DashboardModel;