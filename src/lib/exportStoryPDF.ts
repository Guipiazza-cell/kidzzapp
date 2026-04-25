/**
 * Export a generated story as a printable "livrinho" PDF.
 * - Cover page with title, child name, KIDZZAPP brand
 * - One page per scene with scene image (if available, JPG/PNG)
 * - Footer "Criado com KIDZZAPP ❤️" + page number
 *
 * Uses jsPDF's standard fonts (Helvetica) — no external font loading.
 */
import jsPDF from "jspdf";

interface ExportArgs {
  title: string;
  childName: string;
  scenes: string[];
  images?: string[]; // data URLs or http(s) URLs
}

const PAGE_W = 148; // A5 portrait mm
const PAGE_H = 210;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

async function urlToDataUrl(url: string): Promise<{ data: string; mime: string } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const mime = blob.type || "image/jpeg";
    const data = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    return { data, mime };
  } catch {
    return null;
  }
}

function detectImageFormat(dataUrl: string): "JPEG" | "PNG" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  return "JPEG";
}

function drawFooter(pdf: jsPDF, page: number, total: number) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text("Criado com KIDZZAPP ❤️", MARGIN, PAGE_H - 6);
  pdf.text(`${page} / ${total}`, PAGE_W - MARGIN, PAGE_H - 6, { align: "right" });
}

export async function exportStoryPDF({ title, childName, scenes, images = [] }: ExportArgs) {
  const pdf = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
  const totalPages = scenes.length + 1;

  // ── COVER ──
  pdf.setFillColor(255, 249, 240); // bg cream
  pdf.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Decorative band
  pdf.setFillColor(255, 140, 0);
  pdf.rect(0, 0, PAGE_W, 22, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("KIDZZAPP", PAGE_W / 2, 14, { align: "center" });

  // Title block
  pdf.setTextColor(40, 40, 40);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  const wrapped = pdf.splitTextToSize(title, CONTENT_W);
  pdf.text(wrapped, PAGE_W / 2, 80, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(120);
  pdf.text(`Uma história mágica para`, PAGE_W / 2, 110, { align: "center" });
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 140, 0);
  pdf.setFontSize(18);
  pdf.text(childName, PAGE_W / 2, 122, { align: "center" });

  // Cover image (first scene image, if any)
  if (images[0]) {
    const img = await urlToDataUrl(images[0]);
    if (img) {
      const fmt = detectImageFormat(img.data);
      const size = 90;
      try {
        pdf.addImage(img.data, fmt, (PAGE_W - size) / 2, 135, size, size, undefined, "FAST");
      } catch {
        /* skip if format unsupported */
      }
    }
  }

  // Date
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(160);
  pdf.text(
    new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    PAGE_W / 2,
    PAGE_H - 16,
    { align: "center" }
  );

  drawFooter(pdf, 1, totalPages);

  // ── SCENES ──
  for (let i = 0; i < scenes.length; i++) {
    pdf.addPage();
    pdf.setFillColor(255, 252, 247);
    pdf.rect(0, 0, PAGE_W, PAGE_H, "F");

    let cursorY = MARGIN + 4;

    // Scene header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(255, 140, 0);
    pdf.text(`CENA ${i + 1}`, MARGIN, cursorY);
    cursorY += 6;

    // Image
    if (images[i]) {
      const img = await urlToDataUrl(images[i]);
      if (img) {
        const fmt = detectImageFormat(img.data);
        const h = 70;
        try {
          pdf.addImage(img.data, fmt, MARGIN, cursorY, CONTENT_W, h, undefined, "FAST");
          cursorY += h + 6;
        } catch {
          /* skip */
        }
      }
    }

    // Body
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(45, 45, 45);
    const paragraphs = scenes[i].split("\n").map((p) => p.trim()).filter(Boolean);
    for (const para of paragraphs) {
      const lines = pdf.splitTextToSize(para, CONTENT_W);
      for (const line of lines) {
        if (cursorY > PAGE_H - 18) {
          drawFooter(pdf, i + 2, totalPages);
          pdf.addPage();
          pdf.setFillColor(255, 252, 247);
          pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
          cursorY = MARGIN + 4;
        }
        pdf.text(line, MARGIN, cursorY);
        cursorY += 6;
      }
      cursorY += 2; // paragraph spacing
    }

    drawFooter(pdf, i + 2, totalPages);
  }

  const safe = childName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  pdf.save(`kidzzapp-historia-${safe}.pdf`);
}
