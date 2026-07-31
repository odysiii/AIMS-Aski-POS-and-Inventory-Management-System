-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Uncategorized',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingOrder" (
    "id" SERIAL NOT NULL,
    "orderReference" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "cashierId" TEXT NOT NULL DEFAULT 'CASHIER-1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingOrderItem" (
    "id" SERIAL NOT NULL,
    "pendingOrderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "PendingOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "transactionNo" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supervisorAuthorized" BOOLEAN NOT NULL DEFAULT false,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL DEFAULT 'CASHIER-1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reconciliation" (
    "id" SERIAL NOT NULL,
    "reconciliationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashierId" TEXT NOT NULL,
    "p1000" INTEGER NOT NULL DEFAULT 0,
    "p500" INTEGER NOT NULL DEFAULT 0,
    "p200" INTEGER NOT NULL DEFAULT 0,
    "p100" INTEGER NOT NULL DEFAULT 0,
    "p50" INTEGER NOT NULL DEFAULT 0,
    "p20" INTEGER NOT NULL DEFAULT 0,
    "p10" INTEGER NOT NULL DEFAULT 0,
    "p5" INTEGER NOT NULL DEFAULT 0,
    "p1" INTEGER NOT NULL DEFAULT 0,
    "c25" INTEGER NOT NULL DEFAULT 0,
    "totalCountedCash" DOUBLE PRECISION NOT NULL,
    "expectedSystemCash" DOUBLE PRECISION NOT NULL,
    "variance" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "PendingOrder_orderReference_key" ON "PendingOrder"("orderReference");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionNo_key" ON "Transaction"("transactionNo");

-- AddForeignKey
ALTER TABLE "PendingOrderItem" ADD CONSTRAINT "PendingOrderItem_pendingOrderId_fkey" FOREIGN KEY ("pendingOrderId") REFERENCES "PendingOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
