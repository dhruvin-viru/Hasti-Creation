'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Order, StoreSettings } from '@/types/ecommerce';
import { getStoreSettings, DEFAULT_STORE_SETTINGS } from '@/lib/firestoreServices';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

interface ShippingLabelModalProps {
  order: Order;
  onClose: () => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({ order, onClose }) => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const printContentRef = useRef<HTMLDivElement | null>(null);

  const trackingId = order.trackingNumber || `TRK-${order.id.substring(0, 10).toUpperCase()}`;
  const courier = order.courierName || 'Delhivery';
  const isPrepaid = order.paymentMethod !== 'cod';
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB');
  const invoiceDate = order.invoiceDate || orderDate;
  const invoiceNo = order.invoiceNumber || `INV-${order.id.substring(0, 8).toUpperCase()}`;

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    getStoreSettings().then((settings) => {
      setStoreSettings(settings);
      setLoadingSettings(false);
    });
  }, []);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, trackingId, {
          format: 'CODE128',
          displayValue: false,
          height: 48,
          margin: 0,
          width: 1.8,
        });
      } catch (err) {
        console.warn('Barcode generation error:', err);
      }
    }

    if (trackingId) {
      QRCode.toDataURL(trackingId, {
        width: 110,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      }).then(setQrDataUrl).catch((err) => {
        console.warn('QR Code generation error:', err);
      });
    }
  }, [trackingId, loadingSettings]);

  const handlePrint = () => {
    if (!printContentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label & Invoice #${order.orderId || order.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 5mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #000000 !important;
              background-color: #ffffff !important;
              margin: 0;
              padding: 12px;
            }
            * { box-sizing: border-box; }
            .label-wrapper {
              width: 100% !important;
              max-width: 800px !important;
              margin: 0 auto !important;
              border: 3px solid #000000 !important;
              background-color: #ffffff !important;
            }
            .grid-cols-12 { display: grid !important; grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
            .col-span-7 { grid-column: span 7 / span 7 !important; }
            .col-span-6 { grid-column: span 6 / span 6 !important; }
            .col-span-5 { grid-column: span 5 / span 5 !important; }
            .border-black { border-color: #000000 !important; }
            .border-2 { border-width: 2px !important; border-style: solid !important; }
            .border-b-2 { border-bottom: 2px solid #000000 !important; }
            .border-r-2 { border-right: 2px solid #000000 !important; }
            .border-b { border-bottom: 1px solid #000000 !important; }
            .border-r { border-right: 1px solid #000000 !important; }
            .border-t { border-top: 1px solid #000000 !important; }
            .border { border: 1px solid #000000 !important; }
            .bg-black { background-color: #000000 !important; color: #ffffff !important; }
            .bg-slate-100 { background-color: #f1f5f9 !important; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .text-white { color: #ffffff !important; }
            .text-black { color: #000000 !important; }
            table { border-collapse: collapse !important; width: 100% !important; }
            th, td { border-color: #000000 !important; }
            .barcode-svg { max-width: 100%; height: 48px; }
          </style>
        </head>
        <body>
          ${printContentRef.current.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 600);
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] flex flex-col">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Shipping Label & Tax Invoice</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 font-mono font-bold">
                #{order.orderId || order.id}
              </span>
            </h2>
            <p className="text-xs text-slate-500">Auto-generated dynamic barcode, QR code, and tax invoice</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area Wrapper */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div ref={printContentRef} className="label-wrapper border-2 border-black bg-white text-black font-sans text-xs">
            {/* TOP CONTAINER: Split Customer/Return Address & Shipping/Barcode Header */}
            <div className="grid grid-cols-12 border-b-2 border-black">
              {/* Left Column (7 cols): Customer & Return Address */}
              <div className="col-span-7 border-r-2 border-black flex flex-col justify-between">
                {/* Customer Address */}
                <div className="p-3 border-b-2 border-black space-y-1">
                  <div className="font-extrabold text-sm text-black">Customer Address</div>
                  <div className="font-bold text-black text-sm">{order.customerDetails.name}</div>
                  <div className="text-black font-medium leading-snug">
                    {order.customerDetails.address}
                  </div>
                  <div className="font-bold text-black">
                    {order.customerDetails.city}
                    {order.customerDetails.state ? `, ${order.customerDetails.state}` : ''}, {order.customerDetails.zipCode}
                  </div>
                  <div className="text-black font-mono text-[11px] pt-0.5">
                    Phone: {order.customerDetails.phone || 'N/A'}
                  </div>
                </div>

                {/* Return Address */}
                <div className="p-3 bg-slate-50/50 space-y-1">
                  <div className="text-[11px] font-bold text-black uppercase">If undelivered, return to:</div>
                  <div className="font-extrabold text-black uppercase tracking-tight">{storeSettings.storeName}</div>
                  <div className="text-black text-[11px] leading-snug font-medium">
                    {storeSettings.address}, {storeSettings.city}, {storeSettings.state} Pin code {storeSettings.zipCode}
                  </div>
                  <div className="text-black text-[11px] font-mono">
                    Phone: {storeSettings.phone}
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Courier, QR, Barcode, Tracking */}
              <div className="col-span-5 p-3 flex flex-col justify-between space-y-2">
                {/* Payment Banner */}
                <div className="bg-black text-white font-extrabold text-xs px-2.5 py-1.5 rounded-sm tracking-wide text-center uppercase">
                  {isPrepaid ? 'Prepaid: Do not collect cash' : `COD: Collect Rs. ${order.totalAmount.toFixed(2)}`}
                </div>

                {/* Courier & Destination Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-black">{courier}</span>
                    <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pickup</span>
                  </div>

                  <div className="text-[11px]">
                    <span className="text-slate-600 font-semibold">Destination Code: </span>
                    <span className="font-extrabold text-black">
                      {order.destinationCode || `${order.customerDetails.city.toUpperCase()}_HUB`}
                    </span>
                  </div>

                  <div className="text-[11px]">
                    <span className="text-slate-600 font-semibold">Return Code: </span>
                    <span className="font-mono font-bold text-black">
                      {order.returnCode || storeSettings.returnCode}
                    </span>
                  </div>
                </div>

                {/* QR Code & Barcode Section */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-black">
                  {/* QR Code Image */}
                  <div className="flex-shrink-0">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="w-[100px] h-[100px] border border-black" />
                    ) : (
                      <canvas ref={qrCanvasRef} className="w-[100px] h-[100px] border border-black" />
                    )}
                  </div>

                  {/* Barcode & Tracking ID */}
                  <div className="flex-1 text-center flex flex-col items-center justify-center">
                    <div className="w-full flex justify-center">
                      <svg ref={barcodeRef} className="barcode-svg w-full max-w-[200px]" />
                    </div>
                    <div className="font-mono font-extrabold text-sm text-black tracking-wider mt-1">
                      {trackingId}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE CONTAINER: Product Details Summary Table */}
            <div className="border-b-2 border-black">
              <div className="bg-black text-white font-extrabold px-3 py-1 text-xs uppercase tracking-wide">
                Product Details
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-black font-extrabold text-black bg-slate-100/80">
                    <th className="p-2 border-r border-black">SKU</th>
                    <th className="p-2 border-r border-black text-center">Qty</th>
                    <th className="p-2">Order No.</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-black font-medium text-black">
                      <td className="p-2 border-r border-black font-mono font-bold uppercase tracking-wider">
                        {item.sku || `HC-SKU-${item.productId.substring(0, 6).toUpperCase()}`}
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="text-[10px] font-sans font-normal text-slate-800 normal-case">
                            {item.selectedColor ? `Color: ${item.selectedColor}` : ''} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="p-2 border-r border-black text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="p-2 font-mono font-bold">
                        {order.orderId || order.id}_{idx + 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BOTTOM CONTAINER: TAX INVOICE */}
            <div>
              {/* Tax Invoice Header Banner */}
              <div className="border-b-2 border-black px-3 py-1 flex items-center justify-between bg-black text-white">
                <span className="font-extrabold text-xs uppercase tracking-wider">TAX INVOICE</span>
                <span className="text-[10px] font-semibold text-slate-200">Original For Recipient</span>
              </div>

              {/* Bill To & Sold By Grid */}
              <div className="grid grid-cols-12 border-b-2 border-black">
                {/* BILL TO / SHIP TO */}
                <div className="col-span-6 border-r-2 border-black p-3 space-y-1">
                  <div className="font-extrabold text-[11px] text-black uppercase">BILL TO / SHIP TO</div>
                  <div className="font-bold text-black text-xs">{order.customerDetails.name}</div>
                  <div className="text-black text-[11px] leading-tight">
                    {order.customerDetails.address}, {order.customerDetails.city}
                    {order.customerDetails.state ? `, ${order.customerDetails.state}` : ''}, {order.customerDetails.zipCode}
                  </div>
                  <div className="text-black text-[11px] font-semibold">
                    Place of Supply: <span className="font-bold">{order.customerDetails.state || storeSettings.state || ''}</span>
                  </div>
                </div>

                {/* SOLD BY */}
                <div className="col-span-6 p-3 space-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-600">Sold by: </span>
                    <span className="font-extrabold text-black uppercase">{storeSettings.sellerName || ''}</span>
                  </div>
                  <div className="font-bold text-black uppercase">{storeSettings.storeName || ''}</div>
                  <div className="text-black leading-tight">
                    {storeSettings.address}{storeSettings.city ? `, ${storeSettings.city}` : ''}{storeSettings.state ? `, ${storeSettings.state}` : ''}{storeSettings.zipCode ? ` ${storeSettings.zipCode}` : ''}
                  </div>
                  <div className="font-mono font-bold text-black pt-0.5">
                    GSTIN - {storeSettings.gstin || ''}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-300 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-500">Order No: </span>
                      <span className="font-bold text-black">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Invoice No: </span>
                      <span className="font-bold text-black">{invoiceNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Order Date: </span>
                      <span className="font-bold text-black">{orderDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Invoice Date: </span>
                      <span className="font-bold text-black">{invoiceDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taxed Items Table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-black font-extrabold text-black bg-slate-100/80 text-[11px]">
                    <th className="p-2 border-r border-black">Description</th>
                    <th className="p-2 border-r border-black">HSN</th>
                    <th className="p-2 border-r border-black text-center">Qty</th>
                    <th className="p-2 border-r border-black text-right">Gross Amount</th>
                    <th className="p-2 border-r border-black text-right">Discount</th>
                    <th className="p-2 border-r border-black text-right">Taxable Value</th>
                    <th className="p-2 border-r border-black text-right">Taxes</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let sumTotalTaxes = 0;

                    const itemRows = order.items.map((item, idx) => {
                      const gross = item.price * item.quantity;
                      const itemDiscount = (order.discountApplied / order.items.length) || 0;
                      const itemTotal = Math.max(0, gross - itemDiscount);
                      const rate = item.gstRate ?? 5;
                      const taxVal = parseFloat((itemTotal * (rate / 100)).toFixed(2));
                      const taxableValue = parseFloat((itemTotal - taxVal).toFixed(2));
                      sumTotalTaxes += taxVal;

                      return (
                        <tr key={idx} className="border-b border-black text-[11px]">
                          <td className="p-2 border-r border-black font-semibold">
                            {item.title}
                            {(item.selectedColor || item.selectedSize) && (
                              <span className="text-[10px] font-normal text-slate-700 block">
                                ({item.selectedColor ? item.selectedColor : ''}{item.selectedColor && item.selectedSize ? ' | ' : ''}{item.selectedSize ? `Size: ${item.selectedSize}` : ''})
                              </span>
                            )}
                          </td>
                          <td className="p-2 border-r border-black font-mono">
                            {item.hsn || storeSettings.defaultHsn || ''}
                          </td>
                          <td className="p-2 border-r border-black text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="p-2 border-r border-black text-right font-mono">
                            Rs. {gross.toFixed(2)}
                          </td>
                          <td className="p-2 border-r border-black text-right font-mono">
                            Rs. {itemDiscount.toFixed(2)}
                          </td>
                          <td className="p-2 border-r border-black text-right font-mono">
                            Rs. {taxableValue.toFixed(2)}
                          </td>
                          <td className="p-2 border-r border-black text-right font-mono text-[10px]">
                            IGST @{rate.toFixed(1)}%<br />
                            Rs. {taxVal.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold">
                            Rs. {itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    });

                    const shippingFee = order.shippingFee || 0;

                    return (
                      <>
                        {itemRows}
                        {/* Shipping / Logistics Charges Row */}
                        <tr className="border-b border-black text-[11px] bg-slate-50/50">
                          <td className="p-2 border-r border-black font-medium">Other Charges (Logistics Fee)</td>
                          <td className="p-2 border-r border-black font-mono">{storeSettings.defaultHsn || ''}</td>
                          <td className="p-2 border-r border-black text-center">NA</td>
                          <td className="p-2 border-r border-black text-right font-mono">Rs. {shippingFee.toFixed(2)}</td>
                          <td className="p-2 border-r border-black text-right font-mono">Rs. 0.00</td>
                          <td className="p-2 border-r border-black text-right font-mono">Rs. {shippingFee.toFixed(2)}</td>
                          <td className="p-2 border-r border-black text-right font-mono text-[10px]">
                            IGST @0.0%<br />Rs. 0.00
                          </td>
                          <td className="p-2 text-right font-mono font-bold">Rs. {shippingFee.toFixed(2)}</td>
                        </tr>

                        {/* Summary Total Row */}
                        <tr className="font-extrabold text-black bg-slate-100/90 text-xs">
                          <td colSpan={6} className="p-2 border-r border-black uppercase text-left">
                            Total
                          </td>
                          <td className="p-2 border-r border-black text-right font-mono text-[11px]">
                            Rs. {sumTotalTaxes.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-mono text-sm">
                            Rs. {order.totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>

              {/* Invoice Footer Disclaimer */}
              <div className="p-2 text-[9px] text-slate-700 leading-tight font-medium bg-slate-50/50">
                Tax is not payable on reverse charge basis. This is a computer generated invoice and does not require signature.
                Other charges are charges that are applicable to your order and include charges for logistics fee (where applicable).
                Includes discounts for your city and/or online payments (as applicable).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
