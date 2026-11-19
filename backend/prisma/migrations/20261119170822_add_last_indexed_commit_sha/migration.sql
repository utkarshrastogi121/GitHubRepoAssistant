-- AlterTable
ALTER TABLE "IndexRun" ADD COLUMN     "commitSha" TEXT;

-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "lastIndexedCommitSha" TEXT;
