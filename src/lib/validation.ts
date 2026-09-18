import { z } from "zod";
export const episodeInput = z.object({title:z.string().min(3),slug:z.string().regex(/^[a-z0-9-]+$/),youtubeUrl:z.string().url(),youtubeVideoId:z.string().length(11),episodeNumber:z.coerce.number().int().positive().optional(),description:z.string().max(5000).optional(),seriesId:z.string().cuid().optional(),topicIds:z.array(z.string().cuid()).default([]),status:z.enum(['DRAFT','PUBLISHED','ARCHIVED']).default('DRAFT')});
export type EpisodeInput=z.infer<typeof episodeInput>;
