import { useMemo } from "react";

// minimal, dependency-free markdown renderer for tutor responses and editorials.
// supports fenced code blocks, headings, bullet / numbered lists, paragraphs,
// inline code, bold and italic. Everything is rendered as React nodes (no raw html).

const renderInline = (text, keyPrefix) => {
  const nodes = [];
  // underscores are deliberately not treated as emphasis: identifiers like GEMINI_API_KEY are common
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("`")) nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    else if (token.startsWith("**")) nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
};

const renderTextBlock = (block, keyPrefix) => {
  const lines = block.split("\n");
  const elements = [];
  let listItems = [];
  let listType = null;
  let paragraph = [];
  let k = 0;

  const flushParagraph = () => {
    if (paragraph.length) {
      elements.push(<p key={`${keyPrefix}-p${k++}`}>{renderInline(paragraph.join(" "), `${keyPrefix}-p${k}`)}</p>);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      const Tag = listType === "ol" ? "ol" : "ul";
      elements.push(
        <Tag key={`${keyPrefix}-l${k++}`}>
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item, `${keyPrefix}-li${k}-${idx}`)}</li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (!line.trim()) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const Tag = `h${Math.min(4, heading[1].length)}`;
      elements.push(<Tag key={`${keyPrefix}-h${k++}`}>{renderInline(heading[2], `${keyPrefix}-h${k}`)}</Tag>);
    } else if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";
      if (listType && listType !== type) flushList();
      listType = type;
      listItems.push((bullet || numbered)[1]);
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return elements;
};

export default function Markdown({ content, className = "" }) {
  const nodes = useMemo(() => {
    const text = String(content || "");
    const parts = text.split(/```/);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        // fenced code block: first line may be the language
        const newline = part.indexOf("\n");
        const language = newline === -1 ? "" : part.slice(0, newline).trim();
        const code = newline === -1 ? part : part.slice(newline + 1);
        return (
          <pre key={`code-${idx}`} data-language={language || undefined}>
            <code>{code.replace(/\n$/, "")}</code>
          </pre>
        );
      }
      return renderTextBlock(part, `t${idx}`);
    });
  }, [content]);

  return <div className={`markdown-body ${className}`}>{nodes}</div>;
}
