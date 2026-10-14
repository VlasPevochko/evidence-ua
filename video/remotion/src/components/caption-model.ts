export const splitCaptionIntoChunks = (text: string, maxWords = 6): string[] => {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  const chunks: string[] = [];
  for (let index = 0; index < words.length; index += maxWords) {
    chunks.push(words.slice(index, index + maxWords).join(' '));
  }
  return chunks.length > 0 ? chunks : [''];
};

export const captionChunkIndex = (
  frame: number,
  fps: number,
  chunkCount: number,
  secondsPerChunk = 1.45,
): number => {
  if (chunkCount <= 1) return 0;
  const rawIndex = Math.floor(frame / Math.max(1, fps * secondsPerChunk));
  return Math.min(Math.max(rawIndex, 0), chunkCount - 1);
};
