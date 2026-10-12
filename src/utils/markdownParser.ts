/**
 * Lightweight, robust Markdown to HTML / XHTML parser for eBook rendering
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function markdownToHtml(markdown: string, isXhtml = false): string {
  if (!markdown) return '';

  const lines = markdown.split(/\r?\n/);
  const result: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];

  const flushBlockquote = () => {
    if (inBlockquote) {
      const content = blockquoteBuffer.map(processInline).join('<br />');
      result.push(`<blockquote><p>${content}</p></blockquote>`);
      blockquoteBuffer = [];
      inBlockquote = false;
    }
  };

  const flushLists = () => {
    if (inList) {
      result.push('</ul>');
      inList = false;
    }
    if (inOrderedList) {
      result.push('</ol>');
      inOrderedList = false;
    }
  };

  function processInline(text: string): string {
    // Bold italic
    let s = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__(.*?)__/g, '<strong>$1</strong>');
    // Italic
    s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
    s = s.replace(/_(.*?)_/g, '<em>$1</em>');
    // Code
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    return s;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushBlockquote();
      flushLists();
      continue;
    }

    // Horizontal Rule / Scene Break
    if (/^(\*\s*\*\s*\*|---\s*|___\s*)$/.test(line)) {
      flushBlockquote();
      flushLists();
      result.push(isXhtml ? '<hr class="scene-break" />' : '<hr class="my-8 border-stone-700/50" />');
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      flushLists();
      inBlockquote = true;
      blockquoteBuffer.push(line.replace(/^>\s?/, ''));
      continue;
    } else {
      flushBlockquote();
    }

    // Headings
    if (line.startsWith('# ')) {
      flushLists();
      result.push(`<h1>${processInline(escapeHtml(line.slice(2)))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      flushLists();
      result.push(`<h2>${processInline(escapeHtml(line.slice(3)))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      flushLists();
      result.push(`<h3>${processInline(escapeHtml(line.slice(4)))}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      flushLists();
      result.push(`<h4>${processInline(escapeHtml(line.slice(5)))}</h4>`);
      continue;
    }

    // Unordered list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${processInline(escapeHtml(line.slice(2)))}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (!inOrderedList) {
        result.push('<ol>');
        inOrderedList = true;
      }
      result.push(`<li>${processInline(escapeHtml(olMatch[2]))}</li>`);
      continue;
    }

    flushLists();

    // Standard Paragraph
    result.push(`<p>${processInline(escapeHtml(line))}</p>`);
  }

  flushBlockquote();
  flushLists();

  return result.join('\n');
}

export function calculateWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTime(words: number): number {
  return Math.max(1, Math.ceil(words / 220)); // Average reading speed ~220 wpm
}
