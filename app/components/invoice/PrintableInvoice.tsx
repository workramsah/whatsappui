'use client';

import { cn } from '@/lib/utils';

type PrintableInvoiceItem = {
  description: string;
  qty: number;
  rate: number;
  amount: number;
};

type PrintableInvoiceProps = {
  companyName?: string;
  companyAddress?: string[];
  companyContact?: string;
  companyEmail?: string;
  companyPhone?: string;
  logoUrl?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  dueDate?: string | null;
  customerName?: string | null;
  customerAddress?: string[];
  customerContact?: string | null;
  statusText?: string | null;
  paymentMethod?: string | null;
  items: PrintableInvoiceItem[];
  subtotal: number;
  discount?: number | null;
  tax?: number | null;
  total: number;
  notes?: string | null;
  className?: string;
};

export function PrintableInvoice({
  companyName,
  companyAddress,
  companyContact,
  companyEmail,
  companyPhone,
  logoUrl = null,
  invoiceNumber = null,
  invoiceDate = null,
  dueDate = null,
  customerName = null,
  customerAddress = [],
  customerContact = null,
  statusText = null,
  paymentMethod = null,
  items,
  subtotal,
  discount = null,
  tax = null,
  total,
  notes = null,
  className,
}: PrintableInvoiceProps) {
  const hasCustomerAddress = customerAddress && customerAddress.length > 0;

  const companyAddressLines = [...(companyAddress || [])];
  if (companyEmail) companyAddressLines.push(companyEmail);
  if (companyPhone) companyAddressLines.push(companyPhone);

  return (
    <article
      className={cn(
        'print:bg-white print:text-[#111] text-[#111] bg-white max-w-[900px] mx-auto',
        className
      )}
    >
      {/* Header */}
      <section className="flex flex-wrap justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 min-w-[220px]">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
          )}
          {companyName && <p className="text-xl font-semibold">{companyName}</p>}
          {companyAddressLines.length > 0 && (
            <div className="text-sm leading-relaxed text-[#333]">
              {companyAddressLines.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2 text-right min-w-[220px]">
          <p className="text-2xl font-bold tracking-wide">INVOICE</p>
          {invoiceNumber && (
            <p className="text-sm">
              Invoice No: <span className="font-medium">{invoiceNumber}</span>
            </p>
          )}
          {invoiceDate && (
            <p className="text-sm">
              Invoice Date: <span className="font-medium">{invoiceDate}</span>
            </p>
          )}
          {dueDate && (
            <p className="text-sm">
              Due Date: <span className="font-medium">{dueDate}</span>
            </p>
          )}
        </div>
      </section>

      {/* Bill To / Meta */}
      <section className="flex flex-wrap justify-between gap-6 py-6 border-b border-slate-200">
        <div className="min-w-[240px] space-y-2">
          {customerName && <p className="text-sm font-semibold">Bill To</p>}
          {customerName && <p className="text-base font-medium">{customerName}</p>}
          {hasCustomerAddress && (
            <div className="text-sm leading-relaxed text-[#333]">
              {customerAddress.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          )}
          {customerContact && (
            <div className="text-sm text-[#333]">
              {customerContact.split(',').map((contact, idx) => (
                <span key={idx}>
                  {contact.trim()}
                  {idx < customerContact.split(',').length - 1 && ' · '}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-[240px] space-y-1 text-right">
          {statusText && (
            <p className="text-sm">
              Status: <span className="font-medium">{statusText}</span>
            </p>
          )}
          {paymentMethod && (
            <p className="text-sm">
              Payment Method: <span className="font-medium">{paymentMethod}</span>
            </p>
          )}
        </div>
      </section>

      {/* Items table */}
      <section className="py-6">
        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-2 text-xs font-semibold uppercase tracking-wide text-[#333]">
          <div className="col-span-6 text-left">Item Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        <div className="divide-y divide-slate-200">
          {items.map((item, idx) => (
            <div
              key={`${item.description}-${idx}`}
              className={cn(
                'grid grid-cols-12 gap-2 py-2 text-sm leading-relaxed',
                idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]'
              )}
            >
              <div className="col-span-6 pr-2">
                <p className="text-[#111]">{item.description}</p>
              </div>
              <div className="col-span-2 text-right tabular-nums font-medium">
                {item.qty}
              </div>
              <div className="col-span-2 text-right tabular-nums font-medium">
                Rs.{item.rate.toFixed(2)}
              </div>
              <div className="col-span-2 text-right tabular-nums font-semibold">
                Rs.{item.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="flex justify-end py-6">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <Row label="Subtotal" value={subtotal} />
          {typeof discount === 'number' && (
            <Row label="Discount" value={discount} />
          )}
          {typeof tax === 'number' && <Row label="Tax" value={tax} />}
          <Row label="Total" value={total} bold />
        </div>
      </section>

      {/* Notes */}
      {notes && (
        <section className="py-4 text-sm text-[#333] leading-relaxed">
          <p className="font-semibold mb-1">Notes</p>
          <p>{notes}</p>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-4 text-xs text-[#333]">
        <p>This is a system-generated invoice.</p>
      </footer>
    </article>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#333]">{label}</span>
      <span
        className={cn(
          'tabular-nums',
          bold ? 'text-base font-semibold text-[#111]' : 'font-medium'
        )}
      >
        Rs.{value.toFixed(2)}
      </span>
    </div>
  );
}
