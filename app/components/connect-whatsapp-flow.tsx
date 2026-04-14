'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileCheck, MessageCircle, Check, X, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    FB?: {
      init: (params: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }) => void;
      login: (callback: (response: { authResponse?: { code: string } }) => void, options: {
        config_id: string;
        response_type: string;
        override_default_response_type: boolean;
        extras: { version: string; featureType: string };
      }) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const FB_APP_ID = '902500642743135';
const FB_WHATSAPP_CONFIG_ID = '1222017556258862';

const PREREQUISITES = [
  'Your WhatsApp Business App version must be 2.24.4 or higher.',
  'Access to your Facebook Business Manager is required.',
  "Your company's legal name and address information.",
  'An active website for your business or the Business Certificate.',
];

const BENEFITS = [
  'Send bulk campaigns and automated notifications.',
  'Build automated chat-flows and auto-replies.',
  'View and reply to chats from both WhatsApp Business App and this dashboard.',
  'Continue using Groups, Status, Calling etc on the Business App.',
];

const LIMITATIONS = [
  "You won't be able to apply for a Blue Tick.",
  "You won't be able to sync your Catalog into your WhatsApp profile from here. You can manage the Catalog from the Business App directly.",
];

export interface ConnectWhatsAppFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when WhatsApp Embedded Signup completes successfully so parent can refresh. */
  onConnectSuccess?: () => void;
}

export function ConnectWhatsAppFlow({
  open,
  onOpenChange,
  onConnectSuccess,
}: ConnectWhatsAppFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [embedStatus, setEmbedStatus] = useState<'idle' | 'opening' | 'saving' | 'success' | 'error'>('idle');
  const [embedMessage, setEmbedMessage] = useState('');
  const authCodeRef = useRef<string | null>(null);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setStep(1);
      setAcknowledged(false);
      setEmbedStatus('idle');
      setEmbedMessage('');
    }
    onOpenChange(isOpen);
  };

  //ss

  const handleContinueFromPrerequisites = () => {
    setStep(2);
  };

  const sendToBackend = useCallback(async (code: string | null, phone_number_id: string, waba_id: string) => {
    setEmbedStatus('saving');
    setEmbedMessage('Saving your WhatsApp connection…');
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setEmbedStatus('error');
      setEmbedMessage('Please log in again and try again.');
      return;
    }
    try {
      const res = await fetch('/api/whatsapp/connect-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: code || undefined, phone_number_id, waba_id }),
      });
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        setEmbedStatus('error');
        setEmbedMessage(data.error || 'Failed to save. You can add details manually in Company Settings.');
        return;
      }
      setEmbedStatus('success');
      setEmbedMessage('WhatsApp connected successfully.');
      onConnectSuccess?.();
      setTimeout(() => handleClose(false), 1500);
    } catch (err) {
      setEmbedStatus('error');
      setEmbedMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }, []);

  useEffect(() => {
    if (step !== 2 || !open) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data || {};
            if (phone_number_id && waba_id) {
              sendToBackend(authCodeRef.current, phone_number_id, waba_id);
            } else {
              setEmbedStatus('error');
              setEmbedMessage('Missing phone number or business account ID from Facebook.');
            }
          } else if (data.event === 'CANCEL') {
            setEmbedStatus('idle');
            setEmbedMessage('Signup was cancelled. You can try again or connect a new number manually.');
          } else if (data.event === 'ERROR') {
            const { error_message } = data.data || {};
            setEmbedStatus('error');
            setEmbedMessage(error_message || 'An error occurred during signup.');
          }
        }
      } catch {
        // ignore non-JSON
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [step, open, sendToBackend]);

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB?.init({
        appId: FB_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v25.0',
      });
    };
    if (window.FB) window.fbAsyncInit?.();
  }, []);

  const handleConnectBusinessApp = () => {
    if (typeof window.FB === 'undefined') {
      setEmbedMessage('Facebook is loading… Please wait a moment and click again.');
      return;
    }
    authCodeRef.current = null;
    setEmbedMessage('');
    setEmbedStatus('opening');
    window.FB.login(
      (response) => {
        if (response.authResponse?.code) authCodeRef.current = response.authResponse.code;
      },
      {
        config_id: FB_WHATSAPP_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { version: 'v3', featureType: 'whatsapp_business_app_onboarding' },
      }
    );
  };

  const handleConnectNewNumber = () => {
    handleClose(false);
    router.push('/settings/company#whatsapp');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 1 && (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-4">
                  <FileCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <DialogTitle className="text-center">
                Before proceeding, please ensure you have the following:
              </DialogTitle>
            </DialogHeader>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-1">
              {PREREQUISITES.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <label className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(!!v)}
                className="mt-0.5 shrink-0"
              />
              <span className="text-sm group-hover:text-foreground transition-colors">
                I have read and understood all the above points
              </span>
            </label>
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={handleContinueFromPrerequisites}
                disabled={!acknowledged}
                className="w-full sm:w-auto min-w-[140px] bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-4">
                  <MessageCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <DialogTitle className="text-center">
                Connect a Number for your WhatsApp Business API Account
              </DialogTitle>
            </DialogHeader>
            {open && step === 2 && (
              <Script
                src="https://connect.facebook.net/en_US/sdk.js"
                strategy="lazyOnload"
                onLoad={() => window.fbAsyncInit?.()}
              />
            )}
            <div id="fb-root" />
            <div className="space-y-4">
              <div className="grid gap-2">
                <Button
                  onClick={handleConnectBusinessApp}
                  disabled={embedStatus === 'opening' || embedStatus === 'saving'}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {embedStatus === 'opening' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening Facebook…
                    </>
                  ) : embedStatus === 'saving' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Connect your WhatsApp Business App'
                  )}
                </Button>
                <Button
                  onClick={handleConnectNewNumber}
                  disabled={embedStatus === 'opening' || embedStatus === 'saving'}
                  variant="outline"
                  className="w-full h-11 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  Connect new number
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                By connecting, you agree to our{' '}
                <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Terms and Conditions
                </Link>
                , and to Meta&apos;s terms for WhatsApp Business and Facebook.
              </p>
              {(embedMessage || embedStatus === 'success') && (
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    embedStatus === 'error'
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : embedStatus === 'success'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                        : 'border-border bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {embedMessage}
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <h4 className="text-sm font-semibold">Why connect your WhatsApp Business App</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {BENEFITS.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {LIMITATIONS.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <X className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
