// Utility to derive "mini titles" from content blocks when only one big title exists
// Works with the shared text presentation block types

import {
  AnyContentBlock,
  HeadlineBlock,
  BulletListBlock,
  NumberedListBlock,
  ParagraphBlock,
  AlertBlock,
} from "../types/textPresentation";

export interface DeriveMiniTitlesOptions {
  maxTitles?: number;
  minChars?: number;
}

function cleanCandidateTitle(raw: string): string {
  let text = raw || "";
  // Remove markdown-style bold markers and backticks
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");
  // Cut after colon, dash, or en dash if present to keep concise
  text = text.split(/\s*[\-–:]\s*/)[0] || text;
  // Trim and collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Limit to first ~8 words to keep it short
  const words = text.split(" ");
  if (words.length > 8) {
    text = words.slice(0, 8).join(" ");
  }

  return text;
}

function extractTextFromListItem(item: unknown): string {
  if (typeof item === "string") {
    return item;
  }
  const block = item as AnyContentBlock | undefined;
  if (!block || typeof block !== "object") return "";
  switch ((block as AnyContentBlock).type) {
    case "headline":
      return (block as HeadlineBlock).text;
    case "paragraph":
      return (block as ParagraphBlock).text;
    case "alert":
      return (block as AlertBlock).title || (block as AlertBlock).text || "";
    default:
      return "";
  }
}

function countH2Headlines(blocks: AnyContentBlock[]): number {
  return blocks.reduce((acc, blk) => {
    if (blk.type === "headline" && (blk as HeadlineBlock).level === 2) return acc + 1;
    return acc;
  }, 0);
}

/**
 * Derive a list of concise "mini titles" from content blocks when only a single H2 headline exists.
 * Heuristics:
 * - Prefer existing H3/H4 (important) headlines within the first section
 * - Otherwise, use top items from bullet/numbered lists
 * - As a last resort, take the first sentence from paragraphs
 */
export function deriveMiniTitlesFromBlocks(
  blocks: AnyContentBlock[],
  options: DeriveMiniTitlesOptions = {}
): string[] {
  const { maxTitles = 5, minChars = 3 } = options;
  if (!Array.isArray(blocks) || blocks.length === 0) return [];

  // Only trigger when the document has exactly one H2 headline
  if (countH2Headlines(blocks) !== 1) return [];

  // Find the index after the first H2, then scan until next H2 (or end)
  const firstH2Index = blocks.findIndex(
    (b) => b.type === "headline" && (b as HeadlineBlock).level === 2
  );
  let endIndexExclusive = blocks.length;
  for (let i = firstH2Index + 1; i < blocks.length; i++) {
    const blk = blocks[i];
    if (blk.type === "headline" && (blk as HeadlineBlock).level === 2) {
      endIndexExclusive = i;
      break;
    }
  }

  const candidates: string[] = [];

  // 1) Prefer H3/H4 important headlines
  for (let i = firstH2Index + 1; i < endIndexExclusive; i++) {
    const blk = blocks[i];
    if (
      blk.type === "headline" &&
      (((blk as HeadlineBlock).level === 3 || (blk as HeadlineBlock).level === 4) &&
        ((blk as HeadlineBlock).isImportant === true || (blk as HeadlineBlock).level === 4))
    ) {
      candidates.push((blk as HeadlineBlock).text);
      if (candidates.length >= maxTitles) break;
    }
  }

  // 2) If still lacking, take items from bullet/numbered lists
  if (candidates.length < maxTitles) {
    for (let i = firstH2Index + 1; i < endIndexExclusive; i++) {
      const blk = blocks[i];
      if (blk.type === "bullet_list" || blk.type === "numbered_list") {
        const list = blk as BulletListBlock | NumberedListBlock;
        for (const item of list.items) {
          const txt = extractTextFromListItem(item);
          if (txt) candidates.push(txt);
          if (candidates.length >= maxTitles) break;
        }
      }
      if (candidates.length >= maxTitles) break;
    }
  }

  // 3) As a last resort, use first sentences from paragraphs
  if (candidates.length < maxTitles) {
    for (let i = firstH2Index + 1; i < endIndexExclusive; i++) {
      const blk = blocks[i];
      if (blk.type === "paragraph") {
        const text = (blk as ParagraphBlock).text || "";
        // naive sentence split
        const sentence = text.split(/[.!?]\s/)[0] || text;
        if (sentence) candidates.push(sentence);
      }
      if (candidates.length >= maxTitles) break;
    }
  }

  // Clean, dedupe, and filter
  const result: string[] = [];
  const seen = new Set<string>();
  for (const c of candidates) {
    const cleaned = cleanCandidateTitle(c);
    if (cleaned.length >= minChars && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      result.push(cleaned);
    }
    if (result.length >= maxTitles) break;
  }

  return result;
}

/**
 * Optionally create synthetic H3 headline blocks from derived mini titles.
 * This allows consumers to render them as real subheadings if desired.
 */
export function createMiniHeadlineBlocks(
  titles: string[]
): HeadlineBlock[] {
  return titles.map((t) => ({
    type: "headline",
    level: 3,
    text: t,
    isImportant: true,
  }));
}


