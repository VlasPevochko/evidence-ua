export const splitCaptionIntoChunks = (text: string, maxWords = 6): string[] => {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  if (words.length === 0) return [''];
  if (words.length <= maxWords) return [words.join(' ')];

  const chunkCount = Math.ceil(words.length / maxWords);
  const baseSize = Math.floor(words.length / chunkCount);
  const largerChunkCount = words.length % chunkCount;
  const chunks: string[] = [];
  let offset = 0;

  for (let index = 0; index < chunkCount; index += 1) {
    const size = baseSize + (index < largerChunkCount ? 1 : 0);
    chunks.push(words.slice(offset, offset + size).join(' '));
    offset += size;
  }

  return chunks;
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
