import JSZip from 'jszip';
import { Book } from '../types/book';
import { markdownToHtml } from './markdownParser';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function generateEpub(book: Book): Promise<Blob> {
  const zip = new JSZip();
  const bookId = `urn:uuid:${book.id || 'folioai-book-' + Date.now()}`;
  const timestamp = new Date().toISOString();

  // 1. mimetype (MUST be first file in archive, and uncompressed!)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.folder('META-INF')?.file('container.xml', containerXml);

  // 3. Stylesheet for the eBook
  const css = `
@charset "utf-8";
body {
  margin: 5% 8%;
  font-family: "Georgia", "Times New Roman", serif;
  line-height: 1.65;
  color: #1a1a1a;
  text-align: justify;
}
h1, h2, h3, h4 {
  font-family: "Palatino", "Georgia", serif;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  color: #111827;
}
h1 {
  font-size: 2em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
  margin-top: 2em;
}
h2 {
  font-size: 1.4em;
  margin-top: 1.4em;
}
h3 {
  font-size: 1.15em;
}
p {
  margin-top: 0;
  margin-bottom: 0.85em;
  text-indent: 1.2em;
}
p:first-of-type, h1 + p, h2 + p, h3 + p, hr + p, blockquote + p {
  text-indent: 0;
}
blockquote {
  margin: 1.5em 1em;
  padding: 0.6em 1.2em;
  border-left: 3px solid #d97706;
  font-style: italic;
  color: #374151;
  background-color: #f9fafb;
}
ul, ol {
  margin: 1em 1.5em;
  padding-left: 1.2em;
}
li {
  margin-bottom: 0.4em;
}
hr.scene-break {
  border: 0;
  height: 1px;
  background-color: transparent;
  margin: 2em auto;
  text-align: center;
}
hr.scene-break::before {
  content: "* * *";
  display: block;
  font-size: 1.2em;
  letter-spacing: 0.5em;
  color: #9ca3af;
}
.title-page {
  text-align: center;
  margin-top: 25%;
}
.book-title {
  font-size: 2.4em;
  font-weight: bold;
  margin-bottom: 0.3em;
  color: #111827;
}
.book-subtitle {
  font-size: 1.25em;
  font-style: italic;
  color: #4b5563;
  margin-bottom: 2em;
}
.book-author {
  font-size: 1.2em;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1f2937;
  margin-top: 3em;
}
.publisher {
  font-size: 0.85em;
  color: #9ca3af;
  margin-top: 5em;
  letter-spacing: 0.05em;
}
.toc-list {
  list-style: none;
  padding: 0;
  margin: 2em 0;
}
.toc-item {
  margin: 0.8em 0;
  padding-bottom: 0.4em;
  border-bottom: 1px dotted #e5e7eb;
}
.toc-link {
  text-decoration: none;
  color: #1f2937;
  display: flex;
  justify-content: space-between;
}
`;
  zip.folder('OEBPS')?.file('styles.css', css);

  // 4. Title page XHTML
  const titlePageHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head>
  <title>${escapeXml(book.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body epub:type="titlepage">
  <div class="title-page">
    <h1 class="book-title">${escapeXml(book.title)}</h1>
    ${book.subtitle ? `<div class="book-subtitle">${escapeXml(book.subtitle)}</div>` : ''}
    <div class="book-author">By ${escapeXml(book.author || 'Author')}</div>
    <div class="publisher">Published with FolioAI Manuscript Engine</div>
  </div>
</body>
</html>`;
  zip.folder('OEBPS')?.file('titlepage.xhtml', titlePageHtml);

  // 5. Generate XHTML for each chapter
  const validChapters = book.chapters.filter((ch) => ch.content && ch.content.trim().length > 0);
  const chaptersToExport = validChapters.length > 0 ? validChapters : book.chapters;

  chaptersToExport.forEach((chapter, index) => {
    const chapterHtmlContent = markdownToHtml(chapter.content || `# Chapter ${chapter.number}: ${chapter.title}\n\n*Draft in progress...*`, true);

    const chapterDoc = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head>
  <title>Chapter ${chapter.number}: ${escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body epub:type="bodymatter chapter">
  <section class="chapter-content">
    ${chapterHtmlContent}
  </section>
</body>
</html>`;

    zip.folder('OEBPS')?.file(`chapter_${index + 1}.xhtml`, chapterDoc);
  });

  // 6. Navigation Document (EPUB 3 nav.xhtml)
  const navItems = chaptersToExport.map((ch, idx) => 
    `      <li><a href="chapter_${idx + 1}.xhtml">Chapter ${ch.number}: ${escapeXml(ch.title)}</a></li>`
  ).join('\n');

  const navHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="titlepage.xhtml">Title Page</a></li>
${navItems}
    </ol>
  </nav>
</body>
</html>`;
  zip.folder('OEBPS')?.file('nav.xhtml', navHtml);

  // 7. NCX Document (for EPUB 2 / older e-readers compatibility)
  const ncxNavPoints = chaptersToExport.map((ch, idx) => `
    <navPoint id="navPoint-${idx + 2}" playOrder="${idx + 2}">
      <navLabel><text>Chapter ${ch.number}: ${escapeXml(ch.title)}</text></navLabel>
      <content src="chapter_${idx + 1}.xhtml"/>
    </navPoint>`).join('');

  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(book.title)}</text></docTitle>
  <docAuthor><text>${escapeXml(book.author || 'Author')}</text></docAuthor>
  <navMap>
    <navPoint id="navPoint-1" playOrder="1">
      <navLabel><text>Title Page</text></navLabel>
      <content src="titlepage.xhtml"/>
    </navPoint>
    ${ncxNavPoints}
  </navMap>
</ncx>`;
  zip.folder('OEBPS')?.file('toc.ncx', tocNcx);

  // 8. Package Document (OEBPS/content.opf)
  const manifestItems = [
    '<item id="style" href="styles.css" media-type="text/css"/>',
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
    '<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>',
    ...chaptersToExport.map((_, idx) => `<item id="chapter_${idx + 1}" href="chapter_${idx + 1}.xhtml" media-type="application/xhtml+xml"/>`),
  ].join('\n    ');

  const spineItems = [
    '<itemref idref="titlepage"/>',
    ...chaptersToExport.map((_, idx) => `<itemref idref="chapter_${idx + 1}"/>`),
  ].join('\n    ');

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookID">${bookId}</dc:identifier>
    <dc:title>${escapeXml(book.title)}</dc:title>
    <dc:creator>${escapeXml(book.author || 'Author')}</dc:creator>
    <dc:language>en</dc:language>
    <dc:description>${escapeXml(book.description || '')}</dc:description>
    <dc:publisher>FolioAI</dc:publisher>
    <dc:date>${timestamp}</dc:date>
    <meta property="dcterms:modified">${timestamp}</meta>
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`;
  zip.folder('OEBPS')?.file('content.opf', contentOpf);

  // Generate ZIP Blob
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadBookEpub(book: Book) {
  const blob = await generateEpub(book);
  const filename = `${slugify(book.title || 'manuscript')}.epub`;
  downloadBlob(blob, filename);
}
