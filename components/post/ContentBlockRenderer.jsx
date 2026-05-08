"use client";

import Image from "next/image";

/**
 * Renders rich content blocks (text, GIFs, emojis) in a post
 * @param {Object} props
 * @param {Array} props.blocks - Array of content blocks
 * @param {string} props.className - Additional CSS classes
 */
export default function ContentBlockRenderer({ blocks, className = "" }) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "text":
            return (
              <span key={index} className="text-inherit">
                {block.content}
              </span>
            );

          case "emoji":
            return (
              <span key={index} className="text-xl inline-block mx-0.5">
                {block.content}
              </span>
            );

          case "gif":
            return (
              <div
                key={index}
                className="my-3 relative rounded-lg overflow-hidden max-w-full"
                style={{
                  width: block.metadata?.width || "auto",
                  maxWidth: "100%",
                }}
              >
                <div className="relative w-full" style={{ aspectRatio: block.metadata?.aspectRatio || "16/9" }}>
                  <Image
                    src={block.content}
                    alt={block.metadata?.title || "GIF"}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 500px"
                    loading="lazy"
                    unoptimized // Giphy URLs don't need optimization
                  />
                </div>
                {block.metadata?.title && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {block.metadata.title}
                  </p>
                )}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

/**
 * Convert old-style content string to content blocks
 * @param {string} content - Legacy content string
 * @returns {Array} - Array of content blocks
 */
export function convertContentToBlocks(content) {
  if (!content) return [];

  const blocks = [];
  // Simple regex to detect GIF URLs and emojis
  const gifRegex = /(https:\/\/media\.giphy\.com\/media\/[^\s]+\.gif)/g;
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

  // For now, treat entire content as text block
  // This can be enhanced later to parse inline GIFs and emojis
  blocks.push({
    type: "text",
    content: content,
  });

  return blocks;
}

/**
 * Serialize content blocks to string for storage
 * @param {Array} blocks - Array of content blocks
 * @returns {string} - Plain text representation
 */
export function serializeBlocksToString(blocks) {
  if (!blocks || blocks.length === 0) return "";

  return blocks
    .map((block) => {
      switch (block.type) {
        case "text":
          return block.content;
        case "emoji":
          return block.content;
        case "gif":
          return `[GIF: ${block.metadata?.title || "Animated"}]`;
        default:
          return "";
      }
    })
    .join("");
}
