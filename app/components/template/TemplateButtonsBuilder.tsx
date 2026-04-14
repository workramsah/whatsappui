"use client";

import type { ReactNode } from "react";
import { ExternalLink, Phone, Plus, Tag, Trash2 } from "lucide-react";

export const MAX_TEMPLATE_BUTTONS = 10;
export const MAX_QUICK_REPLIES = 25;

export type WebsiteRow = {
  id: string;
  buttonText: string;
  websiteUrl: string;
  showVariable: boolean;
  variableValue: string;
};

export type QuickReplyRow = { id: string; text: string; payload?: string };

export type TemplateButtonsBuilderValue = {
  discountOffer: {
    enabled: boolean;
    buttonText: string;
    discountCode: string;
    showVariable: boolean;
    variableValue: string;
  };
  website: { enabled: boolean; rows: WebsiteRow[] };
  phone: {
    enabled: boolean;
    buttonText: string;
    phoneNumber: string;
    showVariable: boolean;
    variableValue: string;
  };
  quickReplies: { enabled: boolean; items: QuickReplyRow[] };
};

export type TemplateButtonPayload =
  | { type: "QUICK_REPLY"; text: string }
  | { type: "URL"; text: string; url: string; example?: string[] }
  | { type: "PHONE_NUMBER"; text: string; phone_number: string }
  | { type: "COPY_CODE"; example: string[] };

export function createInitialButtonsBuilder(): TemplateButtonsBuilderValue {
  return {
    discountOffer: {
      enabled: false,
      buttonText: "",
      discountCode: "",
      showVariable: false,
      variableValue: "",
    },
    website: {
      enabled: false,
      rows: [{ id: crypto.randomUUID(), buttonText: "", websiteUrl: "", showVariable: false, variableValue: "" }],
    },
    phone: {
      enabled: false,
      buttonText: "",
      phoneNumber: "",
      showVariable: false,
      variableValue: "",
    },
    quickReplies: { enabled: false, items: [] },
  };
}

function examplesForUrl(url: string, variableSample?: string): string[] | undefined {
  const markers = url.match(/\{\{\d+\}\}/g);
  if (!markers?.length) return undefined;
  const v = variableSample?.trim();
  if (v) {
    if (markers.length === 1) return [v];
    const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= markers.length) return parts.slice(0, markers.length);
  }
  return markers.map((_, i) => `sample${i + 1}`);
}

/** Count buttons that would be sent to Meta (respects enabled flags; media variant ignores discount/quick). */
export function countConfiguredButtons(
  v: TemplateButtonsBuilderValue,
  variant: "full" | "media"
): number {
  if (variant === "media") {
    let n = 0;
    if (v.phone.phoneNumber.trim()) n++;
    const urlRow = v.website.rows.find((r) => r.websiteUrl.trim());
    if (urlRow) n++;
    return n;
  }
  let n = 0;
  if (v.discountOffer.enabled && v.discountOffer.discountCode.trim()) n++;
  if (v.website.enabled) {
    for (const r of v.website.rows) {
      if (r.buttonText.trim() && r.websiteUrl.trim()) n++;
    }
  }
  if (v.phone.enabled && v.phone.buttonText.trim() && v.phone.phoneNumber.trim()) n++;
  if (v.quickReplies.enabled) {
    n += v.quickReplies.items.filter((i) => i.text.trim()).length;
  }
  return n;
}

export function buttonsBuilderToApiPayload(
  v: TemplateButtonsBuilderValue,
  variant: "full" | "media"
): TemplateButtonPayload[] {
  const out: TemplateButtonPayload[] = [];

  if (variant === "full" && v.discountOffer.enabled && v.discountOffer.discountCode.trim()) {
    out.push({ type: "COPY_CODE", example: [v.discountOffer.discountCode.trim()] });
  }

  const websiteActive = variant === "media" || v.website.enabled;
  if (websiteActive) {
    for (const r of v.website.rows) {
      if (!r.buttonText.trim() || !r.websiteUrl.trim()) continue;
      const url = r.websiteUrl.trim();
      const ex = examplesForUrl(url, r.variableValue);
      out.push({
        type: "URL",
        text: r.buttonText.trim().slice(0, 25),
        url,
        ...(ex?.length ? { example: ex } : {}),
      });
    }
  }

  const phoneActive = variant === "media" || v.phone.enabled;
  if (phoneActive && v.phone.buttonText.trim() && v.phone.phoneNumber.trim()) {
    out.push({
      type: "PHONE_NUMBER",
      text: v.phone.buttonText.trim().slice(0, 25),
      phone_number: v.phone.phoneNumber.trim(),
    });
  }

  if (variant === "full" && v.quickReplies.enabled) {
    for (const q of v.quickReplies.items) {
      if (!q.text.trim()) continue;
      // Pass the payload if provided, Meta supports it!
      out.push({
        type: "QUICK_REPLY",
        text: q.text.trim().slice(0, 25),
        ...(q.payload?.trim() ? { payload: q.payload.trim() } : {}),
      });
    }
  }

  return out.slice(0, MAX_TEMPLATE_BUTTONS);
}

/** Labels for preview bubble (in template order). */
export function previewButtonLabels(
  v: TemplateButtonsBuilderValue,
  variant: "full" | "media"
): string[] {
  const payload = buttonsBuilderToApiPayload(v, variant);
  return payload.map((b) => {
    if (b.type === "QUICK_REPLY") return b.text;
    if (b.type === "URL") return b.text;
    if (b.type === "PHONE_NUMBER") return b.text;
    if (b.type === "COPY_CODE") return v.discountOffer.buttonText.trim() || "Copy offer code";
    return "";
  }).filter(Boolean);
}

type Props = {
  value: TemplateButtonsBuilderValue;
  onChange: (next: TemplateButtonsBuilderValue) => void;
  variant: "full" | "media";
};

export function TemplateButtonsBuilder({ value, onChange, variant }: Props) {
  const isMedia = variant === "media";
  const total = countConfiguredButtons(value, variant);
  const remaining = MAX_TEMPLATE_BUTTONS - total;

  const patch = (partial: Partial<TemplateButtonsBuilderValue>) => {
    onChange({ ...value, ...partial });
  };

  const sectionShell = (enabled: boolean, children: ReactNode) => (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        enabled ? "border-emerald-200 bg-emerald-50/35" : "border-gray-200 bg-white"
      }`}
    >
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Buttons</h3>
        <p className="text-xs text-gray-500 mt-1">
          The total number of buttons from all types cannot exceed {MAX_TEMPLATE_BUTTONS}.
          {isMedia
            ? " Media headers use your wa-server: configure phone and website URL below (discount and quick replies are not available for this template type)."
            : null}
        </p>
        <p className="text-xs font-medium text-emerald-800 mt-2">
          {total} / {MAX_TEMPLATE_BUTTONS} in use
          {!isMedia && remaining >= 0 ? ` · ${remaining} remaining` : null}
        </p>
      </div>

      {/* 1. Discount / copy code */}
      {!isMedia &&
        sectionShell(
          value.discountOffer.enabled,
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer">
              <input
                type="checkbox"
                checked={value.discountOffer.enabled}
                onChange={(e) =>
                  patch({
                    discountOffer: { ...value.discountOffer, enabled: e.target.checked },
                  })
                }
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Tag className="w-4 h-4 text-emerald-700" />
              Add discount offer
            </label>
            {value.discountOffer.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Button text</label>
                    <input
                      type="text"
                      value={value.discountOffer.buttonText}
                      onChange={(e) =>
                        patch({
                          discountOffer: { ...value.discountOffer, buttonText: e.target.value },
                        })
                      }
                      placeholder="Enter text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount code</label>
                    <input
                      type="text"
                      value={value.discountOffer.discountCode}
                      onChange={(e) =>
                        patch({
                          discountOffer: { ...value.discountOffer, discountCode: e.target.value },
                        })
                      }
                      placeholder="Enter discount code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                {!value.discountOffer.showVariable ? (
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        discountOffer: { ...value.discountOffer, showVariable: true },
                      })
                    }
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    + Add a variable
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={value.discountOffer.variableValue}
                      onChange={(e) =>
                        patch({
                          discountOffer: { ...value.discountOffer, variableValue: e.target.value },
                        })
                      }
                      placeholder="Variable sample value"
                      className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patch({
                          discountOffer: {
                            ...value.discountOffer,
                            showVariable: false,
                            variableValue: "",
                          },
                        })
                      }
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                      aria-label="Remove variable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-gray-500">
                  Sent to Meta as a copy-code button (code above). Label in WhatsApp may follow Meta&apos;s copy-code
                  wording.
                </p>
              </>
            )}
          </div>
        )}

      {/* 2. Website URL */}
      {sectionShell(
        isMedia || value.website.enabled,
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer">
            {!isMedia && (
              <input
                type="checkbox"
                checked={value.website.enabled}
                onChange={(e) =>
                  patch({ website: { ...value.website, enabled: e.target.checked } })
                }
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
            )}
            <ExternalLink className="w-4 h-4 text-gray-600" />
            Website URL
          </label>
          {(isMedia || value.website.enabled) && (
            <>
              {value.website.rows.map((row, idx) => (
                <div key={row.id} className="space-y-2 pb-3 border-b border-emerald-100/80 last:border-0 last:pb-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Button text</label>
                      <input
                        type="text"
                        value={row.buttonText}
                        onChange={(e) => {
                          const rows = [...value.website.rows];
                          rows[idx] = { ...row, buttonText: e.target.value };
                          patch({ website: { ...value.website, rows } });
                        }}
                        placeholder="Enter text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Website URL</label>
                      <input
                        type="text"
                        value={row.websiteUrl}
                        onChange={(e) => {
                          const rows = [...value.website.rows];
                          rows[idx] = { ...row, websiteUrl: e.target.value };
                          patch({ website: { ...value.website, rows } });
                        }}
                        placeholder="https://example.com/{{1}}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                  {!row.showVariable ? (
                    <button
                      type="button"
                      onClick={() => {
                        const rows = [...value.website.rows];
                        rows[idx] = { ...row, showVariable: true };
                        patch({ website: { ...value.website, rows } });
                      }}
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                    >
                      + Add a variable
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.variableValue}
                        onChange={(e) => {
                          const rows = [...value.website.rows];
                          rows[idx] = { ...row, variableValue: e.target.value };
                          patch({ website: { ...value.website, rows } });
                        }}
                        placeholder="Sample for {{1}} (comma-separate if multiple)"
                        className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const rows = [...value.website.rows];
                          rows[idx] = { ...row, showVariable: false, variableValue: "" };
                          patch({ website: { ...value.website, rows } });
                        }}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        aria-label="Remove variable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {!isMedia && value.website.rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const rows = value.website.rows.filter((r) => r.id !== row.id);
                        patch({ website: { ...value.website, rows } });
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove URL row
                    </button>
                  )}
                </div>
              ))}
              {!isMedia && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={total >= MAX_TEMPLATE_BUTTONS}
                    onClick={() => {
                      if (countConfiguredButtons(value, "full") >= MAX_TEMPLATE_BUTTONS) return;
                      patch({
                        website: {
                          ...value.website,
                          rows: [
                            ...value.website.rows,
                            {
                              id: crypto.randomUUID(),
                              buttonText: "",
                              websiteUrl: "",
                              showVariable: false,
                              variableValue: "",
                            },
                          ],
                        },
                      });
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 disabled:text-gray-400"
                  >
                    + Add website URL
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 3. Phone */}
      {sectionShell(
        isMedia || value.phone.enabled,
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer">
            {!isMedia && (
              <input
                type="checkbox"
                checked={value.phone.enabled}
                onChange={(e) =>
                  patch({ phone: { ...value.phone, enabled: e.target.checked } })
                }
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
            )}
            <Phone className="w-4 h-4 text-gray-600" />
            Phone number
          </label>
          {(isMedia || value.phone.enabled) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Button text</label>
                  <input
                    type="text"
                    value={value.phone.buttonText}
                    onChange={(e) =>
                      patch({ phone: { ...value.phone, buttonText: e.target.value } })
                    }
                    placeholder="Enter text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone number</label>
                  <input
                    type="tel"
                    value={value.phone.phoneNumber}
                    onChange={(e) =>
                      patch({ phone: { ...value.phone, phoneNumber: e.target.value } })
                    }
                    placeholder="+91234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              {!isMedia && !value.phone.showVariable ? (
                <button
                  type="button"
                  onClick={() =>
                    patch({ phone: { ...value.phone, showVariable: true } })
                  }
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                >
                  + Add a variable
                </button>
              ) : null}
              {!isMedia && value.phone.showVariable && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value.phone.variableValue}
                    onChange={(e) =>
                      patch({ phone: { ...value.phone, variableValue: e.target.value } })
                    }
                    placeholder="Variable sample"
                    className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        phone: { ...value.phone, showVariable: false, variableValue: "" },
                      })
                    }
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 4. Quick replies */}
      {!isMedia &&
        sectionShell(
          value.quickReplies.enabled,
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer">
              <input
                type="checkbox"
                checked={value.quickReplies.enabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  patch({
                    quickReplies: {
                      ...value.quickReplies,
                      enabled,
                      items:
                        enabled && value.quickReplies.items.length === 0
                          ? [{ id: crypto.randomUUID(), text: "" }]
                          : value.quickReplies.items,
                    },
                  });
                }}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Add quick replies
            </label>
            {value.quickReplies.enabled && (
              <>
                <div className="space-y-2">
                  {value.quickReplies.items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border p-2 sm:border-0 sm:p-0 rounded-lg sm:rounded-none border-gray-100">
                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => {
                            const items = value.quickReplies.items.map((i) =>
                              i.id === item.id ? { ...i, text: e.target.value } : i
                            );
                            patch({ quickReplies: { ...value.quickReplies, items } });
                          }}
                          placeholder="Quick reply label (e.g., Yes)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={item.payload || ""}
                          onChange={(e) => {
                            // Regex validation: Uppercase, Numbers, Underscore only
                            const filtered = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
                            const items = value.quickReplies.items.map((i) =>
                              i.id === item.id ? { ...i, payload: filtered.slice(0, 128) } : i
                            );
                            patch({ quickReplies: { ...value.quickReplies, items } });
                          }}
                          required
                          maxLength={128}
                          placeholder="REQUIRED Payload (e.g. YES_ACTION)"
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 font-mono text-xs ${
                            !item.payload 
                              ? "border-red-300 bg-red-50 focus:ring-red-500" 
                              : "border-blue-200 focus:ring-blue-500"
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const items = value.quickReplies.items.filter((i) => i.id !== item.id);
                          patch({ quickReplies: { ...value.quickReplies, items } });
                        }}
                        className="p-2 w-full sm:w-auto mt-1 sm:mt-0 text-red-500 bg-red-50 sm:bg-transparent hover:bg-red-100 rounded-lg flex items-center justify-center"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={
                    value.quickReplies.items.length >= MAX_QUICK_REPLIES ||
                    total >= MAX_TEMPLATE_BUTTONS
                  }
                  onClick={() => {
                    if (value.quickReplies.items.length >= MAX_QUICK_REPLIES) return;
                    if (countConfiguredButtons(value, "full") >= MAX_TEMPLATE_BUTTONS) return;
                    patch({
                      quickReplies: {
                        ...value.quickReplies,
                        items: [
                          ...value.quickReplies.items,
                          { id: crypto.randomUUID(), text: "" },
                        ],
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 disabled:text-gray-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add another (0–{MAX_QUICK_REPLIES} replies)
                </button>
              </>
            )}
          </div>
        )}
    </div>
  );
}
