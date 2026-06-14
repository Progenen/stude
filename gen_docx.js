// Generates Q&A .docx files from doc_structured.json
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, LevelFormat,
  AlignmentType, ShadingType, BorderStyle, PageNumber, Footer,
} = require('docx');

const blocks = JSON.parse(fs.readFileSync('doc_structured.json', 'utf8'));

const CODE_FONT = 'Consolas';
const CODE_SHADE = 'F3F5FC';

function codeParagraph(line, first, last) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: CODE_SHADE, color: 'auto' },
    spacing: { before: first ? 60 : 0, after: last ? 60 : 0, line: 240 },
    indent: { left: 120, right: 120 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: 'C7D2FE', space: 6 },
    },
    children: [new TextRun({ text: line.length ? line : ' ', font: CODE_FONT, size: 17, color: '1A6E3C' })],
  });
}

function renderQuestion(q, children) {
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [new TextRun({ text: q.title, bold: true })],
  }));

  const content = q.content || [];
  let i = 0;
  while (i < content.length) {
    const item = content[i];
    if (item.style === 'code') {
      const lines = [];
      while (i < content.length && content[i].style === 'code') { lines.push(content[i].text); i++; }
      lines.forEach((l, idx) => children.push(codeParagraph(l, idx === 0, idx === lines.length - 1)));
    } else if (item.style === '16') {
      children.push(new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        spacing: { after: 40 },
        children: [new TextRun(item.text)],
      }));
      i++;
    } else if (item.style === 'h4') {
      children.push(new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [new TextRun({ text: item.text, bold: true, color: '2E4FA0' })],
      }));
      i++;
    } else {
      children.push(new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun(item.text)],
      }));
      i++;
    }
  }
}

function buildDoc(subjectTitle, blockList) {
  const children = [];
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: 'Экзаменационные ответы', bold: true, size: 40 })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: subjectTitle, size: 26, color: '5A6480' })],
  }));

  blockList.forEach(b => {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 320, after: 120 },
      children: [new TextRun({ text: b.title, bold: true })],
    }));
    b.questions.forEach(q => renderQuestion(q, children));
  });

  return new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 30, bold: true, font: 'Arial', color: '1F4E79' },
          paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 25, bold: true, font: 'Arial', color: '2E4FA0' },
          paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } },
      ],
    },
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 240 } } } }],
      }],
    },
    sections: [{
      properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Стр. ', size: 18, color: '8892B0' }),
                     new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '8892B0' })],
        })] }),
      },
      children,
    }],
  });
}

const targets = [
  { file: 'answers_python.docx',
    subject: 'Разработка приложений на Python', blocks: [blocks[0], blocks[1]] },
  { file: 'answers_tools.docx',
    subject: 'Инструментальные средства разработки программ', blocks: [blocks[2], blocks[3]] },
];

(async () => {
  for (const t of targets) {
    const doc = buildDoc(t.subject, t.blocks);
    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(t.file, buf);
    const qn = t.blocks.reduce((n, b) => n + b.questions.length, 0);
    console.log('written:', t.file, '(' + qn + ' Q&A,', buf.length, 'bytes)');
  }
})();
