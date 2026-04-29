"use client";

function buildPrintHtml(title, content) {
  const styles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map((node) => node.outerHTML)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${styles}
    <style>
      body {
        margin: 0;
        padding: 24px;
        background: #ffffff;
      }

      [data-no-print="true"] {
        display: none !important;
      }
    </style>
  </head>
  <body>
    ${content}
    <script>
      window.addEventListener("load", function () {
        setTimeout(function () {
          window.print();
        }, 300);
      });

      window.addEventListener("afterprint", function () {
        window.close();
      });
    </script>
  </body>
</html>`;
}

export function exportElementToPdf(element, title = "relatorio") {
  if (!element || typeof window === "undefined") {
    return;
  }

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");

  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildPrintHtml(title, element.outerHTML));
  printWindow.document.close();
}
