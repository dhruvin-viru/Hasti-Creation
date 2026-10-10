'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Order, StoreSettings } from '@/types/ecommerce';
import { getStoreSettings, DEFAULT_STORE_SETTINGS } from '@/lib/firestoreServices';
import { X, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

interface BulkShippingLabelModalProps {
  orders: Order[];
  onClose: () => void;
}

export const BulkShippingLabelModal: React.FC<BulkShippingLabelModalProps> = ({ orders, onClose }) => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const printContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getStoreSettings().then(setStoreSettings);

    // Generate QR codes for all selected orders
    async function generateQRs() {
      const qrs: Record<string, string> = {};
      for (const ord of orders) {
        const trk = ord.trackingNumber || `TRK-${ord.id.substring(0, 10).toUpperCase()}`;
        try {
          const url = await QRCode.toDataURL(trk, {
            width: 100,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' }
          });
          qrs[ord.id] = url;
        } catch (e) {
          console.warn(e);
        }
      }
      setQrCodes(qrs);
    }
    generateQRs();
  }, [orders]);

  useEffect(() => {
    // Generate barcodes for each order's SVG
    orders.forEach((ord) => {
      const trk = ord.trackingNumber || `TRK-${ord.id.substring(0, 10).toUpperCase()}`;
      const svgEl = document.getElementById(`bulk-barcode-${ord.id}`);
      if (svgEl) {
        try {
          JsBarcode(svgEl, trk, {
            format: 'CODE128',
            displayValue: false,
            height: 44,
            margin: 0,
            width: 1.6,
          });
        } catch (err) {
          console.warn(err);
        }
      }
    });
  }, [orders, qrCodes]);

  const handlePrint = () => {
    if (!printContentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulk Shipping Labels (${orders.length} Orders)</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 4mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .page-break {
                page-break-after: always !important;
                break-after: page !important;
              }
            }
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #000000 !important;
              background-color: #ffffff !important;
              margin: 0;
              padding: 8px;
            }
            * { box-sizing: border-box; }
            .label-wrapper {
              width: 100% !important;
              max-width: 800px !important;
              margin: 0 auto 16px auto !important;
              border: 3px solid #000000 !important;
              background-color: #ffffff !important;
              font-size: 11px !important;
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
            .barcode-svg { max-width: 100%; height: 44px; }
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
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Bulk Shipping Labels Batch</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 font-bold">
                {orders.length} Orders Selected
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Print all selected labels stacked for A4 sheet printing (2 per page or 1 per page)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print All ({orders.length}) Labels</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Batch Print Preview Window */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          <div ref={printContentRef}>
            {orders.map((ord, index) => {
              const trk = ord.trackingNumber || `TRK-${ord.id.substring(0, 10).toUpperCase()}`;
              const courier = ord.courierName || 'Delhivery';
              const isPrepaid = ord.paymentMethod !== 'cod';
              const orderDate = new Date(ord.createdAt).toLocaleDateString('en-GB');
              const invoiceDate = ord.invoiceDate || orderDate;
              const invoiceNo = ord.invoiceNumber || `INV-${ord.id.substring(0, 8).toUpperCase()}`;

              return (
                <div key={ord.id} className="label-wrapper border-2 border-black bg-white text-black font-sans text-xs mb-8 page-break">
                  {/* TOP CONTAINER */}
                  <div className="grid grid-cols-12 border-b-2 border-black">
                    {/* Left Column: Customer & Return Address */}
                    <div className="col-span-7 border-r-2 border-black flex flex-col justify-between">
                      <div className="p-3 border-b-2 border-black space-y-1">
                        <div className="font-extrabold text-xs text-black uppercase">Customer Address</div>
                        <div className="font-bold text-black text-sm">{ord.customerDetails.name}</div>
                        <div className="text-black font-medium leading-snug text-[11px]">
                          {ord.customerDetails.address}
                        </div>
                        <div className="font-bold text-black text-[11px]">
                          {ord.customerDetails.city}
                          {ord.customerDetails.state ? `, ${ord.customerDetails.state}` : ''}, {ord.customerDetails.zipCode}
                        </div>
                        <div className="text-black font-mono text-[10px] pt-0.5">
                          Phone: {ord.customerDetails.phone || 'N/A'}
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50/50 space-y-1 text-[10px]">
                        <div className="font-bold text-black uppercase">If undelivered, return to:</div>
                        <div className="font-extrabold text-black uppercase">{storeSettings.storeName}</div>
                        <div className="text-black leading-snug font-medium">
                          {storeSettings.address}, {storeSettings.city}, {storeSettings.state} Pin code {storeSettings.zipCode}
                        </div>
                        <div className="text-black font-mono">
                          Phone: {storeSettings.phone}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Courier, Payment, QR & Barcode */}
                    <div className="col-span-5 p-3 flex flex-col justify-between space-y-2">
                      <div className="bg-black text-white font-extrabold text-xs px-2 py-1 rounded-sm text-center uppercase">
                        {isPrepaid ? 'Prepaid: Do not collect cash' : `COD: Collect Rs. ${ord.totalAmount.toFixed(2)}`}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-black">{courier}</span>
                          <span className="bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Pickup</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="text-slate-600 font-semibold">Destination Code: </span>
                          <span className="font-extrabold text-black">
                            {ord.destinationCode || `${ord.customerDetails.city.toUpperCase()}_HUB`}
                          </span>
                        </div>
                        <div className="text-[10px]">
                          <span className="text-slate-600 font-semibold">Return Code: </span>
                          <span className="font-mono font-bold text-black">
                            {ord.returnCode || storeSettings.returnCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-black">
                        <div className="flex-shrink-0">
                          {qrCodes[ord.id] ? (
                            <img src={qrCodes[ord.id]} alt="QR" className="w-[90px] h-[90px] border border-black" />
                          ) : (
                            <div className="w-[90px] h-[90px] border border-black flex items-center justify-center text-[9px]">QR</div>
                          )}
                        </div>

                        <div className="flex-1 text-center flex flex-col items-center justify-center">
                          <div className="w-full flex justify-center">
                            <svg id={`bulk-barcode-${ord.id}`} className="barcode-svg w-full max-w-[170px]" />
                          </div>
                          <div className="font-mono font-extrabold text-xs text-black tracking-wider mt-0.5">
                            {trk}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MIDDLE CONTAINER: Products */}
                  <div className="border-b-2 border-black">
                    <div className="bg-black text-white font-extrabold px-3 py-0.5 text-[11px] uppercase">
                      Product Details
                    </div>
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-black font-extrabold text-black bg-slate-100/80">
                          <th className="p-1.5 border-r border-black">SKU</th>
                          <th className="p-1.5 border-r border-black text-center">Qty</th>
                          <th className="p-1.5">Order No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ord.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-black font-medium text-black">
                            <td className="p-1.5 border-r border-black font-mono font-bold uppercase tracking-wider">
                              {item.sku || `HC-SKU-${item.productId.substring(0, 6).toUpperCase()}`}
                              {(item.selectedColor || item.selectedSize) && (
                                <div className="text-[9px] font-sans font-normal text-slate-800 normal-case">
                                  {item.selectedColor ? `Color: ${item.selectedColor}` : ''} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                                </div>
                              )}
                            </td>
                            <td className="p-1.5 border-r border-black text-center font-bold">
                              {item.quantity}
                            </td>
                            <td className="p-1.5 font-mono font-bold">
                              {ord.orderId || ord.id}_{idx + 1}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* BOTTOM CONTAINER: Tax Invoice */}
                  <div>
                    <div className="border-b-2 border-black px-3 py-0.5 flex items-center justify-between bg-black text-white text-[11px]">
                      <span className="font-extrabold uppercase">TAX INVOICE</span>
                      <span className="text-[9px] font-semibold text-slate-200">Original For Recipient</span>
                    </div>

                    <div className="grid grid-cols-12 border-b-2 border-black text-[10px]">
                      <div className="col-span-6 border-r-2 border-black p-2 space-y-0.5">
                        <div className="font-extrabold text-black uppercase">BILL TO / SHIP TO</div>
                        <div className="font-bold text-black">{ord.customerDetails.name}</div>
                        <div className="text-black leading-tight">
                          {ord.customerDetails.address}, {ord.customerDetails.city}
                          {ord.customerDetails.state ? `, ${ord.customerDetails.state}` : ''}, {ord.customerDetails.zipCode}
                        </div>
                        <div className="text-black font-semibold">
                          Place of Supply: <span className="font-bold">{ord.customerDetails.state || storeSettings.state || ''}</span>
                        </div>
                      </div>

                      <div className="col-span-6 p-2 space-y-0.5">
                        <div>
                          <span className="text-slate-600">Sold by: </span>
                          <span className="font-extrabold text-black uppercase">{storeSettings.sellerName || ''}</span>
                        </div>
                        <div className="font-bold text-black uppercase">{storeSettings.storeName || ''}</div>
                        <div className="text-black leading-tight">
                          {storeSettings.address}{storeSettings.city ? `, ${storeSettings.city}` : ''}
                        </div>
                        <div className="font-mono font-bold text-black pt-0.5">
                          GSTIN - {storeSettings.gstin || ''}
                        </div>
                        <div className="grid grid-cols-2 gap-1 pt-0.5 font-mono text-[9px]">
                          <div><span className="text-slate-500">Order: </span><span className="font-bold">{ord.orderId || ord.id}</span></div>
                          <div><span className="text-slate-500">Invoice: </span><span className="font-bold">{invoiceNo}</span></div>
                          <div><span className="text-slate-500">Date: </span><span className="font-bold">{orderDate}</span></div>
                          <div><span className="text-slate-500">Inv Date: </span><span className="font-bold">{invoiceDate}</span></div>
                        </div>
                      </div>
                    </div>

                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="border-b border-black font-extrabold text-black bg-slate-100">
                          <th className="p-1 border-r border-black">Description</th>
                          <th className="p-1 border-r border-black">HSN</th>
                          <th className="p-1 border-r border-black text-center">Qty</th>
                          <th className="p-1 border-r border-black text-right">Gross</th>
                          <th className="p-1 border-r border-black text-right">Disc</th>
                          <th className="p-1 border-r border-black text-right">Taxable</th>
                          <th className="p-1 border-r border-black text-right">Taxes</th>
                          <th className="p-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let totalTax = 0;
                          const rows = ord.items.map((it, idx) => {
                            const gross = it.price * it.quantity;
                            const itemDiscount = (ord.discountApplied / ord.items.length) || 0;
                            const itemTotal = Math.max(0, gross - itemDiscount);
                            const rate = it.gstRate ?? 5;
                            const taxVal = parseFloat((itemTotal * (rate / 100)).toFixed(2));
                            const taxableValue = parseFloat((itemTotal - taxVal).toFixed(2));
                            totalTax += taxVal;

                            return (
                              <tr key={idx} className="border-b border-black">
                                <td className="p-1 border-r border-black font-semibold">
                                  {it.title}
                                  {(it.selectedColor || it.selectedSize) && (
                                    <span className="text-[9px] font-normal text-slate-700 block">
                                      ({it.selectedColor ? it.selectedColor : ''}{it.selectedColor && it.selectedSize ? ' | ' : ''}{it.selectedSize ? `Size: ${it.selectedSize}` : ''})
                                    </span>
                                  )}
                                </td>
                                <td className="p-1 border-r border-black font-mono">{it.hsn || storeSettings.defaultHsn || ''}</td>
                                <td className="p-1 border-r border-black text-center font-bold">{it.quantity}</td>
                                <td className="p-1 border-r border-black text-right font-mono">Rs. {gross.toFixed(2)}</td>
                                <td className="p-1 border-r border-black text-right font-mono">Rs. {itemDiscount.toFixed(2)}</td>
                                <td className="p-1 border-r border-black text-right font-mono">Rs. {taxableValue.toFixed(2)}</td>
                                <td className="p-1 border-r border-black text-right font-mono text-[9px]">IGST @{rate}%<br />Rs. {taxVal.toFixed(2)}</td>
                                <td className="p-1 text-right font-mono font-bold">Rs. {itemTotal.toFixed(2)}</td>
                              </tr>
                            );
                          });

                          const shp = ord.shippingFee || 0;

                          return (
                            <>
                              {rows}
                              <tr className="border-b border-black text-[9px]">
                                <td className="p-1 border-r border-black font-medium">Logistics Fee</td>
                                <td className="p-1 border-r border-black font-mono">{storeSettings.defaultHsn || ''}</td>
                                <td className="p-1 border-r border-black text-center">NA</td>
                                <td className="p-1 border-r border-black text-right font-mono">Rs. {shp.toFixed(2)}</td>
                                <td className="p-1 border-r border-black text-right font-mono">Rs. 0.00</td>
                                <td className="p-1 border-r border-black text-right font-mono">Rs. {shp.toFixed(2)}</td>
                                <td className="p-1 border-r border-black text-right font-mono">Rs. 0.00</td>
                                <td className="p-1 text-right font-mono font-bold">Rs. {shp.toFixed(2)}</td>
                              </tr>
                              <tr className="font-extrabold text-black bg-slate-100 text-[10px]">
                                <td colSpan={6} className="p-1 border-r border-black uppercase text-left">Total</td>
                                <td className="p-1 border-r border-black text-right font-mono">Rs. {totalTax.toFixed(2)}</td>
                                <td className="p-1 text-right font-mono font-bold">Rs. {ord.totalAmount.toFixed(2)}</td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
