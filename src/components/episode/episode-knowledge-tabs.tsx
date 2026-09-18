import { Tab, TabList, TabPanel, Tabs } from "@/components/navigation/tabs";
import { RecommendationsPanel } from "./recommendations-panel";
import { TranscriptReader } from "./transcript-reader";
import { MindMapTree } from "./mind-map-tree";
import type { Recommendation } from "@/types/recommendation";
import type { Transcript } from "@/types/transcript";
import type { MindMap } from "@/types/mind-map";

/** The three episode-intelligence tabs, presented as one cohesive feature. */
export function EpisodeKnowledgeTabs({
  recommendations,
  transcript,
  mindMap,
}: {
  recommendations: Recommendation[];
  transcript: Transcript | null;
  mindMap: MindMap | null;
}) {
  return (
    <Tabs defaultActiveId="recommendations">
      <TabList aria-label="معلومات إضافية عن الحلقة">
        <Tab id="recommendations">التوصيات</Tab>
        <Tab id="transcript">النص الكامل</Tab>
        <Tab id="mind-map">خريطة الحلقة</Tab>
      </TabList>
      <div className="pt-8">
        <TabPanel id="recommendations">
          <RecommendationsPanel recommendations={recommendations} />
        </TabPanel>
        <TabPanel id="transcript">
          <TranscriptReader transcript={transcript} />
        </TabPanel>
        <TabPanel id="mind-map">
          <MindMapTree mindMap={mindMap} />
        </TabPanel>
      </div>
    </Tabs>
  );
}
