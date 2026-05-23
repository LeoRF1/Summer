-- CreateTable
CREATE TABLE "Query" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleCount" INTEGER NOT NULL,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);
