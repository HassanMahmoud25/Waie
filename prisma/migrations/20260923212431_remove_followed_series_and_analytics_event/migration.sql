/*
  Warnings:

  - You are about to drop the `AnalyticsEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FollowedSeries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FollowedSeries" DROP CONSTRAINT "FollowedSeries_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "FollowedSeries" DROP CONSTRAINT "FollowedSeries_userId_fkey";

-- DropTable
DROP TABLE "AnalyticsEvent";

-- DropTable
DROP TABLE "FollowedSeries";
