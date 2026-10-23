import { jsPDF } from 'jspdf';
import { Order, Currency } from '../types';
import { formatPrice } from './format';
import { Language } from '../data/i18n';

/**
 * Generates an isolated, genuine luxury A4 PDF receipt for a specific order.
 * Follows the minimalist RENASC visual identity: editorial restraint, clean lines, and clear typography.
 * Directly triggers download of "RENASC-Receipt-[ORDERNUMBER].pdf".
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

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const cleanOrderNum = (order.orderNumber || order.id || 'ORDER').replace(/[^a-zA-Z0-9-_]/g, '');

    // Page Dimensions & Margins
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Helper: Horizontal Divider
    const drawDivider = (currentY: number, thickness: number = 0.2, color: number = 220) => {
      doc.setDrawColor(color, color, color);
      doc.setLineWidth(thickness);
      doc.line(margin, currentY, pageWidth - margin, currentY);
    };

    // 1. BRAND HEADER (Minimalist Luxury)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(17, 17, 17); // #111111
    doc.text('R E N A S C', pageWidth / 2, y + 4, { align: 'center' });

    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115); // #737373
    doc.text('MAISON DE CONFECTION • ATELIER ALGER', pageWidth / 2, y, { align: 'center' });

    y += 4;
    doc.setFontSize(7.5);
    doc.text('REÇU OFFICIEL D’ACHAT / PURCHASE RECEIPT', pageWidth / 2, y, { align: 'center' });

    y += 6;
    drawDivider(y, 0.4, 17); // Dark solid line
    y += 8;

    // 2. ORDER & CLIENT METADATA (Two-column layout)
    const col1X = margin;
    const col2X = margin + contentWidth / 2 + 5;

    // Column 1: Order Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 17, 17);
    doc.text('RÉFÉRENCE COMMANDE / ORDER', col1X, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(order.orderNumber, col1X, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(115, 115, 115);
    doc.text(`Date : ${order.date || new Date().toLocaleDateString('fr-DZ')}`, col1X, y + 11);

    const statusLabel = order.status || 'Reçu / Confirmed';
    doc.text(`Statut : ${statusLabel}`, col1X, y + 16);

    const paymentLabel = order.paymentMethod === 'baridimob' 
      ? 'Virement BaridiMob / CCP' 
      : 'Paiement à la livraison (Cash)';
    doc.text(`Paiement : ${paymentLabel}`, col1X, y + 21);

    // Column 2: Destination & Delivery Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 17, 17);
    doc.text('DESTINATION & LIVRAISON', col2X, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const clientName = order.customer?.fullName || 'Client';
    doc.text(clientName.slice(0, 32), col2X, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(115, 115, 115);
    const wilayaStr = `Wilaya ${order.customer?.wilayaCode || ''} — ${order.customer?.wilayaName || ''}`;
    doc.text(wilayaStr, col2X, y + 11);

    const cityStr = order.customer?.commune || order.customer?.city || '';
    if (cityStr) {
      doc.text(`Commune : ${cityStr}`, col2X, y + 16);
    }

    const carrierStr = `${order.carrierName || 'Yalidine Express'} (${order.deliveryType === 'home' ? 'À Domicile' : 'StopDesk'})`;
    doc.text(`Mode : ${carrierStr}`, col2X, y + 21);

    if (order.trackingNumber) {
      doc.text(`N° de Suivi : ${order.trackingNumber}`, col2X, y + 26);
    }

    y += 33;
    drawDivider(y, 0.2, 220);
    y += 7;

    // 3. TABLE OF ARTICLES
    // Table Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115);
    doc.text('ARTICLE / DESCRIPTION', margin, y);
    doc.text('TAILLE', margin + 90, y);
    doc.text('QTÉ', margin + 115, y);
    doc.text('PRIX UNIT.', margin + 135, y);
    doc.text('TOTAL', pageWidth - margin, y, { align: 'right' });

    y += 3;
    drawDivider(y, 0.2, 180);
    y += 5;

    // Table Rows
    const items = Array.isArray(order.items) ? order.items : [];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    if (items.length === 0) {
      doc.setTextColor(140, 140, 140);
      doc.text('Détail des pièces de confection', margin, y);
      doc.text(formatPrice(order.total, currency), pageWidth - margin, y, { align: 'right' });
      y += 8;
    } else {
      items.forEach((item) => {
        if (y > pageHeight - 55) {
          doc.addPage();
          y = margin;
        }

        const name = (item.product?.name || 'Vêtement DBC').slice(0, 42);
        const size = String(item.size || 'STD');
        const qty = Number(item.quantity) || 1;
        const price = Number(item.pricePerUnit) || 0;
        const lineTotal = price * qty;

        doc.setTextColor(17, 17, 17);
        doc.text(name, margin, y);
        doc.setTextColor(115, 115, 115);
        doc.text(size, margin + 90, y);
        doc.text(String(qty), margin + 115, y);
        doc.text(formatPrice(price, currency), margin + 135, y);
        doc.setTextColor(17, 17, 17);
        doc.text(formatPrice(lineTotal, currency), pageWidth - margin, y, { align: 'right' });

        y += 6;
      });
    }

    y += 2;
    drawDivider(y, 0.2, 220);
    y += 6;

    // 4. FINANCIAL SUMMARY (Right Aligned)
    const summaryX = pageWidth - margin - 70;
    const valueX = pageWidth - margin;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(115, 115, 115);

    // Subtotal
    doc.text('Sous-total :', summaryX, y);
    doc.setTextColor(17, 17, 17);
    doc.text(formatPrice(order.subtotal, currency), valueX, y, { align: 'right' });

    // Shipping
    y += 5.5;
    doc.setTextColor(115, 115, 115);
    doc.text('Frais de livraison :', summaryX, y);
    doc.setTextColor(17, 17, 17);
    doc.text(order.shipping === 0 ? 'Offerte (Gratuit)' : formatPrice(order.shipping, currency), valueX, y, { align: 'right' });

    // Discount if present
    if (order.discount && order.discount > 0) {
      y += 5.5;
      doc.setTextColor(115, 115, 115);
      doc.text('Remise appliquée :', summaryX, y);
      doc.setTextColor(16, 149, 93); // emerald
      doc.text(`-${formatPrice(order.discount, currency)}`, valueX, y, { align: 'right' });
    }

    // Total Net Line
    y += 4;
    doc.setDrawColor(17, 17, 17);
    doc.setLineWidth(0.4);
    doc.line(summaryX, y, valueX, y);
    y += 5.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(17, 17, 17);
    doc.text('TOTAL NET :', summaryX, y);
    doc.text(formatPrice(order.total, currency), valueX, y, { align: 'right' });

    // 5. FOOTER & AUTHENTICITY NOTE
    const footerY = pageHeight - margin - 15;
    drawDivider(footerY, 0.2, 220);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      'Document officiel généré pour le client par RENASC Maison de Confection Textile.',
      pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );
    doc.text(
      'Alger, Algérie • Livraison 69 Wilayas • Contact : dbcworkshop.co@gmail.com',
      pageWidth / 2,
      footerY + 9,
      { align: 'center' }
    );

    // Save PDF directly to user's device
    const filename = `RENASC-Receipt-${cleanOrderNum}.pdf`;
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF receipt:', error);
    return false;
  }
}
