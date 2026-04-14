'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Status = 'DRAFT' | 'DUE' | 'PAID' | null;

export type InvoicePreviewFooterProps = {
  isAuthed: boolean;
  draftId?: string | null;
  orderId?: string | null;
  invoiceNumber?: string | null;
  status?: Status;
  onPreview: () => void;
  onCreateOrder?: () => Promise<void>;
  onSave?: () => Promise<void>;
  onShare?: () => void;
  onDownload?: () => void;
  onCopyLink?: () => void;
  onSignup?: () => void;
  onLogin?: () => void;
};

export function InvoicePreviewFooter({
  isAuthed,
  draftId,
  orderId,
  invoiceNumber,
  status = null,
  onPreview,
  onCreateOrder,
  onSave,
  onShare,
  onDownload,
  onCopyLink,
  onSignup,
  onLogin,
}: InvoicePreviewFooterProps) {
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave || saving) return;
    try {
      setSaving(true);
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const isDraft = !!draftId && !orderId;
  const isOrder = !!orderId;

  const handleCreate = async () => {
    if (!onCreateOrder || creating) return;
    try {
      setCreating(true);
      await onCreateOrder();
    } finally {
      setCreating(false);
    }
  };

  const shareDisabled = !isAuthed || isDraft || !orderId;
  const actionDisabledMessage = !isAuthed
    ? 'Login to save and reuse this invoice'
    : isDraft
    ? 'Create order to enable sharing'
    : '';

  const helperText = !isAuthed
    ? 'Login to send, download, or save this invoice.'
    : isDraft
    ? 'Create an order to enable sharing and downloads.'
    : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        {isOrder && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">
              Invoice {invoiceNumber ? `#${invoiceNumber}` : ''}
            </div>
            {status && (
              <div
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  status === 'PAID' && 'bg-green-50 text-green-700 border border-green-200',
                  status === 'DUE' && 'bg-amber-50 text-amber-700 border border-amber-200',
                  status === 'DRAFT' && 'bg-slate-100 text-slate-700 border border-slate-200'
                )}
              >
                {status}
              </div>
            )}
          </div>
        )}

        {isAuthed && isDraft && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-12 flex-1 rounded-full bg-[#3B82F6] text-base font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition hover:bg-[#2563EB]"
              onClick={handleCreate}
              disabled={!draftId || creating}
            >
              {creating ? 'Creating order...' : 'Create Order & Enable Sharing'}
            </Button>
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-full text-base"
              onClick={onPreview}
            >
              Preview Invoice
            </Button>
          </div>
        )}

        {isAuthed && isOrder && onSave && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-12 flex-1 rounded-full bg-[#10B981] text-base font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition hover:bg-[#059669]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-full text-base"
              onClick={onPreview}
            >
              Preview Invoice
            </Button>
          </div>
        )}

        {!isAuthed && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Want to save or share this invoice?
              </p>
              <p className="text-sm text-slate-600">
                Create a free account to store orders, download PDFs, and send invoices anytime.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="h-12 flex-1 rounded-full bg-[#3B82F6] text-base font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition hover:bg-[#2563EB]"
                onClick={onSignup}
                disabled={!draftId}
              >
                Create free account & save invoice
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-full text-base"
                onClick={onPreview}
              >
                Preview Invoice
              </Button>
            </div>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                className="h-10 text-sm text-slate-600 hover:text-slate-900"
                onClick={onLogin}
              >
                Already have an account? Log in
              </Button>
            </div>
            <p className="text-center text-xs text-slate-500">
              No credit card required · Takes less than 30 seconds
            </p>
          </div>
        )}

        {isOrder && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              className="h-12 w-full rounded-full"
              onClick={!shareDisabled ? onShare : undefined}
              disabled={shareDisabled}
              title={shareDisabled ? actionDisabledMessage : undefined}
              variant="secondary"
            >
              Share on WhatsApp
            </Button>
            <Button
              className="h-12 w-full rounded-full"
              variant="outline"
              onClick={!shareDisabled ? onDownload : undefined}
              disabled={shareDisabled}
              title={shareDisabled ? actionDisabledMessage : undefined}
            >
              Download PDF
            </Button>
            <Button
              className="h-12 w-full rounded-full"
              variant="outline"
              onClick={!shareDisabled ? onCopyLink : undefined}
              disabled={shareDisabled}
              title={shareDisabled ? actionDisabledMessage : undefined}
            >
              Copy Link
            </Button>
          </div>
        )}

        {helperText && (
          <p className="text-center text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    </div>
  );
}
