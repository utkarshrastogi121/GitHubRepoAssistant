-- CreateTable
CREATE TABLE "CodeNode" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "symbol" TEXT,
    "line" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeEdge" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryMetric" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "sessionId" TEXT,
    "question" TEXT NOT NULL,
    "retrievalMs" INTEGER NOT NULL,
    "llmMs" INTEGER NOT NULL,
    "totalMs" INTEGER NOT NULL,
    "seeds" INTEGER NOT NULL,
    "expandedFiles" INTEGER NOT NULL,
    "finalChunks" INTEGER NOT NULL,
    "graphUsed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueryMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexRun" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "filesParsed" INTEGER NOT NULL,
    "chunksIndexed" INTEGER NOT NULL,
    "graphNodes" INTEGER NOT NULL,
    "graphEdges" INTEGER NOT NULL,
    "totalMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndexRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationRun" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "questions" INTEGER NOT NULL,
    "recallAt5" DOUBLE PRECISION NOT NULL,
    "recallAt10" DOUBLE PRECISION NOT NULL,
    "mrr" DOUBLE PRECISION NOT NULL,
    "hitRate" DOUBLE PRECISION NOT NULL,
    "avgRetrievalMs" DOUBLE PRECISION NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodeNode_repositoryId_filePath_idx" ON "CodeNode"("repositoryId", "filePath");

-- CreateIndex
CREATE UNIQUE INDEX "CodeNode_repositoryId_nodeId_key" ON "CodeNode"("repositoryId", "nodeId");

-- CreateIndex
CREATE INDEX "CodeEdge_repositoryId_fromNodeId_idx" ON "CodeEdge"("repositoryId", "fromNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeEdge_repositoryId_fromNodeId_toNodeId_type_key" ON "CodeEdge"("repositoryId", "fromNodeId", "toNodeId", "type");

-- CreateIndex
CREATE INDEX "QueryMetric_repositoryId_createdAt_idx" ON "QueryMetric"("repositoryId", "createdAt");

-- CreateIndex
CREATE INDEX "IndexRun_repositoryId_createdAt_idx" ON "IndexRun"("repositoryId", "createdAt");

-- CreateIndex
CREATE INDEX "EvaluationRun_repositoryId_createdAt_idx" ON "EvaluationRun"("repositoryId", "createdAt");
