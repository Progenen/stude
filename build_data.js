// Builds doc_structured.json from the two answer markdown files.
const fs = require('fs');

const SOURCES = [
  { file: 'Ответы_Python.md',
    blocks: ['БЛОК 1. PYTHON — ТЕОРИЯ', 'БЛОК 2. PYTHON — ПРАКТИКА'] },
  { file: 'Ответы_Инструментальные_средства.md',
    blocks: ['БЛОК 3. ИНСТРУМЕНТЫ — ТЕОРИЯ', 'БЛОК 4. ИНСТРУМЕНТЫ — ПРАКТИКА'] },
];

function stripInline(s) {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // [text](url) -> text
    .replace(/\*\*(.+?)\*\*/g, '$1')           // **bold** -> bold
    .replace(/\*([^*\n]+)\*/g, '$1')           // *italic* -> italic
    .replace(/`([^`]+)`/g, '$1')               // `code` -> code
    .trim();
}

function isSep(line) {
  // Markdown table separator row: only | - : and spaces
  return /^\|[\s:|-]+$/.test(line);
}

function parseBody(lines) {
  const content = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const t = raw.trim();

    if (t === '' || t === '---') { i++; continue; }

    // Fenced code block
    if (t.startsWith('```')) {
      i++;
      const code = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i].replace(/\s+$/, ''));   // keep indentation, drop trailing ws
        i++;
      }
      i++; // closing fence
      while (code.length && code[0].trim() === '') code.shift();
      while (code.length && code[code.length - 1].trim() === '') code.pop();
      for (const cl of code) content.push({ style: 'code', text: cl });
      continue;
    }

    // Table -> render as monospaced code block
    if (t.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].trim());
        i++;
      }
      for (const row of rows) {
        if (isSep(row)) continue;
        const parts = row.split('|');
        if (parts[0].trim() === '') parts.shift();
        if (parts.length && parts[parts.length - 1].trim() === '') parts.pop();
        const text = parts.map(c => stripInline(c.trim())).join('  |  ');
        content.push({ style: 'code', text });
      }
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(t)) {
      content.push({ style: '16', text: stripInline(t.replace(/^[-*]\s+/, '')) });
      i++; continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(t)) {
      content.push({ style: '16', text: stripInline(t.replace(/^\d+\.\s+/, '')) });
      i++; continue;
    }

    // Blockquote
    if (/^>\s?/.test(t)) {
      content.push({ style: 'Normal', text: stripInline(t.replace(/^>\s?/, '')) });
      i++; continue;
    }

    // Subheading: whole line is bold
    if (/^\*\*[^*].*\*\*[:.]?$/.test(t) && t.length < 90) {
      content.push({ style: 'h4', text: stripInline(t) });
      i++; continue;
    }

    // Paragraph (join wrapped lines)
    const para = [t];
    i++;
    while (i < lines.length) {
      const nt = lines[i].trim();
      if (nt === '' || nt === '---' || nt.startsWith('```') || nt.startsWith('|')
          || /^[-*]\s+/.test(nt) || /^\d+\.\s+/.test(nt) || /^>\s/.test(nt)
          || nt.startsWith('### ')) break;
      para.push(nt);
      i++;
    }
    content.push({ style: 'Normal', text: stripInline(para.join(' ')) });
  }
  return content;
}

const allBlocks = [];

for (const src of SOURCES) {
  const text = fs.readFileSync(src.file, 'utf8');
  const lines = text.split(/\r?\n/);
  let blockIdx = -1;
  let curBlock = null;
  let curQ = null;
  let body = [];

  const flushQ = () => {
    if (curQ) { curQ.content = parseBody(body); curBlock.questions.push(curQ); }
    curQ = null; body = [];
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flushQ();
      curQ = { title: stripInline(line.slice(4).trim()), content: [] };
    } else if (line.startsWith('## ')) {
      flushQ();
      blockIdx++;
      curBlock = { title: src.blocks[blockIdx] || stripInline(line.slice(3).trim()), questions: [] };
      allBlocks.push(curBlock);
    } else if (line.startsWith('# ')) {
      // top-level title — skip
    } else if (curQ) {
      body.push(line);
    }
  }
  flushQ();
}

fs.writeFileSync('doc_structured.json', JSON.stringify(allBlocks, null, 1), 'utf8');
const total = allBlocks.reduce((n, b) => n + b.questions.length, 0);
console.log('doc_structured.json written:', allBlocks.length, 'blocks,', total, 'questions');
allBlocks.forEach(b => console.log('  -', b.title, '|', b.questions.length));
