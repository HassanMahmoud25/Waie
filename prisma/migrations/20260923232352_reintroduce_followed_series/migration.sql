-- CreateTable
CREATE TABLE "FollowedSeries" (
    "userId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowedSeries_pkey" PRIMARY KEY ("userId","seriesId")
);

-- CreateIndex
CREATE INDEX "FollowedSeries_seriesId_idx" ON "FollowedSeries"("seriesId");

-- AddForeignKey
ALTER TABLE "FollowedSeries" ADD CONSTRAINT "FollowedSeries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowedSeries" ADD CONSTRAINT "FollowedSeries_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
