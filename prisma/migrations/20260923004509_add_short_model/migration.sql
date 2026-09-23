-- AlterTable
ALTER TABLE "SyncRun" ADD COLUMN     "shortsCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shortsUpdated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videosUnknown" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Short" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "youtubeTitle" TEXT NOT NULL,
    "youtubeThumbnailUrl" TEXT NOT NULL,
    "youtubeDurationSeconds" INTEGER NOT NULL,
    "youtubePublishedAt" TIMESTAMP(3) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Short_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Short_slug_key" ON "Short"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Short_youtubeVideoId_key" ON "Short"("youtubeVideoId");
