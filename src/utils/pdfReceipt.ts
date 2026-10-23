import { Order, Currency } from '../types';
import { formatPrice } from './format';
import { Language } from '../data/i18n';

/**
 * Pure TypeScript Zero-Dependency PDF Generator for RENASC Luxury Receipts.
 * 
 * Generates an authentic, Adobe-compliant PDF 1.4 vector document directly in the browser.
 * Requires ZERO external npm libraries (eliminates Rollup/Vite resolution errors with jspdf).
 * Triggers instant native download of "RENASC-Receipt-[ORDERNUMBER].pdf".
 */
export function generatePdfReceipt(
  order: Order,
  currency: Currency = 'DZD',
  language: Language = 'fr'
): boolean {
  try {
    if (!order) {
      throw new Error('Order data is missing');
    }

    const cleanOrderNum = (order.orderNumber || order.id || 'ORDER').replace(/[^a-zA-Z0-9-_]/g, '');

    // 1. Text Escaping & WinAnsi character mapping for PDF Type 1 Fonts
    const esc = (txt: string): string => {
      return txt
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
    };

    const toPdfText = (str: string): string => {
      return esc(
        str
          .replace(/é/g, '\\351')
          .replace(/è/g, '\\350')
          .replace(/ê/g, '\\352')
          .replace(/ë/g, '\\353')
          .replace(/à/g, '\\340')
          .replace(/â/g, '\\342')
          .replace(/ô/g, '\\364')
          .replace(/î/g, '\\356')
          .replace(/ï/g, '\\357')
          .replace(/ù/g, '\\371')
          .replace(/û/g, '\\373')
          .replace(/ç/g, '\\347')
          .replace(/É/g, '\\311')
          .replace(/È/g, '\\310')
          .replace(/Ê/g, '\\312')
          .replace(/À/g, '\\300')
          .replace(/Ç/g, '\\307')
          .replace(/’/g, "'")
          .replace(/[^\x00-\x7F]/g, ' ')
      );
    };

    // 2. Vector Stream Drawing Commands
    // A4 dimensions in PDF points: 595.28 pt (width) x 841.89 pt (height)
    let stream = '';

    const text = (
      font: 'F1' | 'F2', // F1: Helvetica, F2: Helvetica-Bold
      size: number,
      x: number,
      y: number,
      rawText: string,
      r = 0.07,
      g = 0.07,
      b = 0.07
    ) => {
      stream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n`;
      stream += `BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${toPdfText(rawText)}) Tj ET\n`;
    };

    const textRight = (
      font: 'F1' | 'F2',
      size: number,
      rightX: number,
      y: number,
      rawText: string,
      r = 0.07,
      g = 0.07,
      b = 0.07
    ) => {
      const charWidth = font === 'F2' ? size * 0.58 : size * 0.52;
      const totalWidth = rawText.length * charWidth;
      const startX = Math.max(50, rightX - totalWidth);
      text(font, size, startX, y, rawText, r, g, b);
    };

    const textCenter = (
      font: 'F1' | 'F2',
      size: number,
      centerX: number,
      y: number,
      rawText: string,
      r = 0.07,
      g = 0.07,
      b = 0.07
    ) => {
      const charWidth = font === 'F2' ? size * 0.58 : size * 0.52;
      const totalWidth = rawText.length * charWidth;
      const startX = centerX - totalWidth / 2;
      text(font, size, startX, y, rawText, r, g, b);
    };

    const line = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      width = 0.5,
      r = 0.85,
      g = 0.85,
      b = 0.85
    ) => {
      stream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG\n`;
      stream += `${width.toFixed(2)} w\n`;
      stream += `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S\n`;
    };

    // 3. Layout Rendering
    const leftX = 50;
    const rightX = 545;
    const midX = 595.28 / 2;
    let y = 790; // Top of page

    // Brand Header (Minimalist luxury aesthetic)
    textCenter('F2', 20, midX, y, 'R E N A S C', 0.07, 0.07, 0.07);
    y -= 14;
    textCenter('F1', 8, midX, y, 'MAISON DE CONFECTION - ATELIER ALGER', 0.45, 0.45, 0.45);
    y -= 11;
    textCenter('F1', 7.5, midX, y, "RECU OFFICIEL D'ACHAT / PURCHASE RECEIPT", 0.45, 0.45, 0.45);
    y -= 14;

    // Dark Divider
    line(leftX, y, rightX, y, 1.0, 0.07, 0.07, 0.07);
    y -= 22;

    // Column 1: Order Meta & Column 2: Destination
    const col2X = 310;
    text('F2', 8.5, leftX, y, 'REFERENCE COMMANDE / ORDER', 0.07, 0.07, 0.07);
    text('F2', 8.5, col2X, y, 'DESTINATION & LIVRAISON', 0.07, 0.07, 0.07);
    y -= 14;

    text('F2', 11, leftX, y, order.orderNumber, 0.07, 0.07, 0.07);
    const clientName = (order.customer?.fullName || 'Client').slice(0, 30);
    text('F2', 10, col2X, y, clientName, 0.07, 0.07, 0.07);
    y -= 14;

    const dateStr = order.date || new Date().toLocaleDateString('fr-DZ');
    text('F1', 8.5, leftX, y, `Date : ${dateStr}`, 0.4, 0.4, 0.4);
    const wilayaStr = `Wilaya ${order.customer?.wilayaCode || ''} - ${order.customer?.wilayaName || ''}`.slice(0, 32);
    text('F1', 8.5, col2X, y, wilayaStr, 0.4, 0.4, 0.4);
    y -= 13;

    text('F1', 8.5, leftX, y, `Statut : ${order.status || 'Recu / Confirmed'}`, 0.4, 0.4, 0.4);
    const communeStr = `Commune : ${order.customer?.commune || order.customer?.city || 'Non specifie'}`.slice(0, 32);
    text('F1', 8.5, col2X, y, communeStr, 0.4, 0.4, 0.4);
    y -= 13;

    const paymentLabel = order.paymentMethod === 'baridimob' ? 'Virement BaridiMob / CCP' : 'Paiement a la livraison (Cash)';
    text('F1', 8.5, leftX, y, `Paiement : ${paymentLabel}`, 0.4, 0.4, 0.4);
    const carrierStr = `${order.carrierName || 'Yalidine Express'} (${order.deliveryType === 'home' ? 'A Domicile' : 'StopDesk'})`;
    text('F1', 8.5, col2X, y, `Mode : ${carrierStr}`, 0.4, 0.4, 0.4);
    y -= 13;

    if (order.trackingNumber) {
      text('F1', 8.5, col2X, y, `N de Suivi : ${order.trackingNumber}`, 0.4, 0.4, 0.4);
      y -= 13;
    }

    y -= 8;
    line(leftX, y, rightX, y, 0.5, 0.88, 0.88, 0.88);
    y -= 16;

    // Items Table Header
    text('F2', 8, leftX, y, 'ARTICLE / DESCRIPTION', 0.45, 0.45, 0.45);
    text('F2', 8, 305, y, 'TAILLE', 0.45, 0.45, 0.45);
    text('F2', 8, 360, y, 'QTE', 0.45, 0.45, 0.45);
    text('F2', 8, 415, y, 'PRIX UNIT.', 0.45, 0.45, 0.45);
    textRight('F2', 8, rightX, y, 'TOTAL', 0.45, 0.45, 0.45);
    y -= 7;
    line(leftX, y, rightX, y, 0.5, 0.7, 0.7, 0.7);
    y -= 14;

    // Table Content Rows
    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) {
      text('F1', 8.5, leftX, y, 'Detail des pieces de confection', 0.5, 0.5, 0.5);
      textRight('F1', 8.5, rightX, y, formatPrice(order.total, currency), 0.07, 0.07, 0.07);
      y -= 16;
    } else {
      for (const item of items) {
        const name = (item.product?.name || 'Vetement DBC').slice(0, 36);
        const size = String(item.size || 'STD');
        const qty = Number(item.quantity) || 1;
        const price = Number(item.pricePerUnit) || 0;
        const lineTotal = price * qty;

        text('F1', 8.5, leftX, y, name, 0.07, 0.07, 0.07);
        text('F1', 8.5, 305, y, size, 0.45, 0.45, 0.45);
        text('F1', 8.5, 360, y, String(qty), 0.45, 0.45, 0.45);
        text('F1', 8.5, 415, y, formatPrice(price, currency), 0.45, 0.45, 0.45);
        textRight('F1', 8.5, rightX, y, formatPrice(lineTotal, currency), 0.07, 0.07, 0.07);
        y -= 15;

        if (y < 160) break;
      }
    }

    line(leftX, y, rightX, y, 0.5, 0.88, 0.88, 0.88);
    y -= 16;

    // Financial Summary
    const summaryColX = 350;
    text('F1', 8.5, summaryColX, y, 'Sous-total :', 0.45, 0.45, 0.45);
    textRight('F1', 8.5, rightX, y, formatPrice(order.subtotal, currency), 0.07, 0.07, 0.07);
    y -= 14;

    text('F1', 8.5, summaryColX, y, 'Frais de livraison :', 0.45, 0.45, 0.45);
    const shippingStr = order.shipping === 0 ? 'Offerte (Gratuit)' : formatPrice(order.shipping, currency);
    textRight('F1', 8.5, rightX, y, shippingStr, 0.07, 0.07, 0.07);
    y -= 14;

    if (order.discount && order.discount > 0) {
      text('F1', 8.5, summaryColX, y, 'Remise appliquee :', 0.45, 0.45, 0.45);
      textRight('F1', 8.5, rightX, y, `-${formatPrice(order.discount, currency)}`, 0.06, 0.58, 0.36);
      y -= 14;
    }

    line(summaryColX, y, rightX, y, 0.8, 0.07, 0.07, 0.07);
    y -= 16;

    text('F2', 10.5, summaryColX, y, 'TOTAL NET :', 0.07, 0.07, 0.07);
    textRight('F2', 10.5, rightX, y, formatPrice(order.total, currency), 0.07, 0.07, 0.07);

    // Footer & Authenticity Notice
    const footerY = 60;
    line(leftX, footerY + 18, rightX, footerY + 18, 0.5, 0.88, 0.88, 0.88);
    textCenter(
      'F1',
      7.5,
      midX,
      footerY + 8,
      'Document officiel genere pour le client par RENASC Maison de Confection Textile.',
      0.5,
      0.5,
      0.5
    );
    textCenter(
      'F1',
      7.5,
      midX,
      footerY - 2,
      'Alger, Algerie - Livraison 69 Wilayas - Contact : dbcworkshop.co@gmail.com',
      0.5,
      0.5,
      0.5
    );

    // 4. Assemble standard PDF 1.4 Binary Structure
    const objects: string[] = [];
    const addObject = (content: string): number => {
      objects.push(content);
      return objects.length;
    };

    const streamBytes = new TextEncoder().encode(stream);
    const streamObj = `<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream`;

    addObject(`<< /Type /Catalog /Pages 2 0 R >>`); // 1: Catalog
    addObject(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`); // 2: Pages
    addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`); // 3: Page
    addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`); // 4: F1
    addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`); // 5: F2
    addObject(streamObj); // 6: Contents

    let pdfBody = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const offsets: number[] = [];

    for (let i = 0; i < objects.length; i++) {
      offsets.push(new TextEncoder().encode(pdfBody).length);
      pdfBody += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefOffset = new TextEncoder().encode(pdfBody).length;
    pdfBody += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) {
      pdfBody += String(off).padStart(10, '0') + ' 00000 n \n';
    }

    pdfBody += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    // 5. Trigger Browser Native Download via Blob
    const blob = new Blob([pdfBody], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RENASC-Receipt-${cleanOrderNum}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Failed to generate PDF receipt:', error);
    return false;
  }
}
