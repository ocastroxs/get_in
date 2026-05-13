"use client";

const MARGIN = 36;
const ROW_PADDING_X = 6;
const ROW_PADDING_Y = 6;
const LINE_HEIGHT = 11;
const HEADER_HEIGHT = 24;

function formatGeneratedAt() {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
}

function valueToText(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function sanitizeFileName(fileName) {
  return fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
}

function drawTableHeader(doc, columns, widths, y, tableWidth) {
  doc.setFillColor(10, 37, 64);
  doc.roundedRect(MARGIN, y, tableWidth, HEADER_HEIGHT, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  let x = MARGIN;
  columns.forEach((column, index) => {
    doc.text(column.header, x + ROW_PADDING_X, y + 15, {
      maxWidth: widths[index] - ROW_PADDING_X * 2,
    });
    x += widths[index];
  });
}

function drawDocumentHeader(doc, { title, subtitle, totalRows, filters }, pageNumber) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 82, "F");
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 82, pageWidth, 82);

  doc.setTextColor(10, 37, 64);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, MARGIN, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  if (subtitle) {
    doc.text(subtitle, MARGIN, 50);
  }

  const meta = `Gerado em ${formatGeneratedAt()} - ${totalRows} registro(s)`;
  doc.text(meta, MARGIN, 66);

  doc.setFontSize(8);
  doc.text(`Pagina ${pageNumber}`, pageWidth - MARGIN, 34, { align: "right" });

  if (filters?.length) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 37, 64);
    doc.text(`Filtros: ${filters.join(" | ")}`, pageWidth - MARGIN, 50, {
      align: "right",
      maxWidth: 320,
    });
  }
}

function getColumnWidths(columns, tableWidth) {
  const totalWeight = columns.reduce((sum, column) => sum + (column.weight || 1), 0);
  return columns.map((column) => (tableWidth * (column.weight || 1)) / totalWeight);
}

function buildWrappedRow(doc, row, columns, widths) {
  return columns.map((column, index) => {
    const cellValue = Array.isArray(row) ? row[index] : row[column.key];
    const lines = doc.splitTextToSize(valueToText(cellValue), widths[index] - ROW_PADDING_X * 2);
    return lines.length ? lines : ["-"];
  });
}

function drawFooter(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, pageHeight - 28, pageWidth - MARGIN, pageHeight - 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Get In - Relatorio gerado automaticamente", MARGIN, pageHeight - 14);
}

export async function exportTableToPdf({
  title,
  subtitle,
  columns,
  rows,
  fileName,
  filters = [],
  orientation = "landscape",
}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableWidth = pageWidth - MARGIN * 2;
  const bottomLimit = pageHeight - 42;
  const widths = getColumnWidths(columns, tableWidth);
  let pageNumber = 1;
  let y = 102;

  doc.setProperties({
    title,
    subject: subtitle || title,
    creator: "Get In",
  });

  drawDocumentHeader(doc, { title, subtitle, totalRows: rows.length, filters }, pageNumber);
  drawTableHeader(doc, columns, widths, y, tableWidth);
  y += HEADER_HEIGHT;

  rows.forEach((row, rowIndex) => {
    const wrappedCells = buildWrappedRow(doc, row, columns, widths);
    const rowHeight = Math.max(
      26,
      Math.max(...wrappedCells.map((lines) => lines.length)) * LINE_HEIGHT + ROW_PADDING_Y * 2
    );

    if (y + rowHeight > bottomLimit) {
      drawFooter(doc);
      doc.addPage();
      pageNumber += 1;
      y = 102;
      drawDocumentHeader(doc, { title, subtitle, totalRows: rows.length, filters }, pageNumber);
      drawTableHeader(doc, columns, widths, y, tableWidth);
      y += HEADER_HEIGHT;
    }

    doc.setFillColor(rowIndex % 2 === 0 ? 255 : 248, rowIndex % 2 === 0 ? 255 : 250, rowIndex % 2 === 0 ? 255 : 252);
    doc.rect(MARGIN, y, tableWidth, rowHeight, "F");
    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN, y + rowHeight, MARGIN + tableWidth, y + rowHeight);

    let x = MARGIN;
    wrappedCells.forEach((lines, columnIndex) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(lines, x + ROW_PADDING_X, y + ROW_PADDING_Y + 8, {
        maxWidth: widths[columnIndex] - ROW_PADDING_X * 2,
      });
      x += widths[columnIndex];
    });

    y += rowHeight;
  });

  drawFooter(doc);
  doc.save(sanitizeFileName(fileName));
}
