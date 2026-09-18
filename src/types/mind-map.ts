export type MindMapNode = {
  id: string;
  label: string;
  description?: string;
  timestampSeconds?: number;
  children: MindMapNode[];
};

export type MindMap = {
  id: string;
  episodeId: string;
  title: string;
  root: MindMapNode;
};
