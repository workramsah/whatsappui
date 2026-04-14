'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Package,
  Upload,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-toastify';
import { apiRequest, uploadFile } from '@/lib/api';
import { cn } from '@/lib/utils';
import { MediaLibrary } from '@/components/media/MediaLibrary';
import { ServiceZonesPanel } from './ServiceZonesPanel';
import { ServiceAvailabilityManager } from './ServiceAvailabilityManager';
import {
  formCopyForKind,
  inferListingKind,
  apiProductType,
  type ListingKind,
} from './listingKindConfig';

interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
}

interface ProductMediaItem extends MediaAsset {
  isPrimary: boolean;
  sortOrder: number;
}

const inp =
  'w-full h-11 rounded-xl border border-[#d8d8d8] px-3 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1da750]/30';
const txt =
  'w-full rounded-xl border border-[#d8d8d8] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1da750]/30';
const sec = 'text-[12px] font-semibold text-[#9e9d9d] tracking-wide mb-3';
const lbl = 'block text-[13px] font-medium text-[#1d1b1c] mb-1';

type Availability = 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  level: string;
  metaPath: string | null;
  metaSubvertical: string | null;
  parentId: string | null;
};

type TemplateRow = {
  id: string;
  metaSubvertical: string;
  key: string;
  label: string;
  placeholder: string | null;
  sortOrder: number;
};

export type ProductFormInitial = {
  id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  description: string | null;
  category: string | null;
  categoryId: string | null;
  imageUrl: string | null;
  productType: 'PRODUCT' | 'SERVICE';
  listingKind?: ListingKind | null;
  availability: string;
  onWhatsapp: boolean;
  onPos: boolean;
  onWeb: boolean;
  condition?: 'NEW' | 'REFURBISHED' | 'USED';
  gtin?: string | null;
  googleProductCategory?: string | null;
  salePrice?: number | null;
  duration?: number | null;
  durationType?: 'FIXED' | 'VARIABLE' | 'ONGOING' | null;
  deliveryMode?: 'IN_PERSON' | 'REMOTE' | 'HOME_VISIT' | 'ANY' | null;
  bookingNoticeHours?: number | null;
  bufferMinutes?: number | null;
  maxBookingsPerSlot?: number | null;
  price?: number;
  pricingUnit?: 
    | 'FLAT' 
    | 'PER_HOUR' 
    | 'PER_SESSION' 
    | 'PER_DAY' 
    | 'PER_MONTH'
    | 'PER_KG'
    | 'PER_GRAM'
    | 'PER_PIECE'
    | 'PER_LITER'
    | 'PER_ML'
    | 'PER_PERSON'
    | 'PER_TABLE'
    | 'PER_TICKET';
  stock?: number | null;
  productCategory?: { metaSubvertical: string | null } | null;
  attributes?: { key: string; value: string }[];
  media?: any[];
};

function mapAvailabilityToForm(raw: string): Availability {
  const v = String(raw || '').toLowerCase();
  if (v.includes('out')) return 'OUT_OF_STOCK';
  if (v.includes('low')) return 'LOW_STOCK';
  return 'IN_STOCK';
}

function mapAvailabilityToApi(a: Availability): string {
  if (a === 'IN_STOCK') return 'in stock';
  if (a === 'OUT_OF_STOCK') return 'out of stock';
  return 'low stock';
}

function categoryOptionLabel(c: CategoryRow): string {
  const indent = c.level === 'L2' ? '  · ' : c.level === 'L3' ? '    · ' : '';
  const path = c.metaPath?.trim();
  return `${indent}${path || c.name}`;
}

type Props = {
  mode: 'create' | 'edit';
  productId?: string;
  initial?: ProductFormInitial | null;
};

export default function ProductForm({ mode, productId, initial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const [form, setForm] = useState({
    productName: '',
    skuRetailerId: '',
    brand: '',
    description: '',
    categoryLegacy: '',
    categoryId: '' as string,
    price: '',
    pricingUnit: 'FLAT' as 
      | 'FLAT' 
      | 'PER_HOUR' 
      | 'PER_SESSION' 
      | 'PER_DAY' 
      | 'PER_MONTH'
      | 'PER_KG'
      | 'PER_GRAM'
      | 'PER_PIECE'
      | 'PER_LITER'
      | 'PER_ML'
      | 'PER_PERSON'
      | 'PER_TABLE'
      | 'PER_TICKET',
    availability: 'IN_STOCK' as Availability,
    listingKind: 'PRODUCT' as ListingKind,
    onWhatsapp: false,
    onPos: true,
    onWeb: false,
    media: [] as ProductMediaItem[],
    condition: 'NEW' as 'NEW' | 'REFURBISHED' | 'USED',
    gtin: '',
    googleProductCategory: '',
    salePrice: '',
    duration: '',
    durationType: '' as '' | 'FIXED' | 'VARIABLE' | 'ONGOING',
    deliveryMode: '' as '' | 'IN_PERSON' | 'REMOTE' | 'HOME_VISIT' | 'ANY',
    bookingNoticeHours: '',
    bufferMinutes: '',
    maxBookingsPerSlot: '',
    stock: '',
  });

  const [attrValues, setAttrValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const copy = useMemo(
    () => formCopyForKind(form.listingKind as 'PRODUCT' | 'SERVICE' | 'EVENT'),
    [form.listingKind],
  );

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === form.listingKind),
    [categories, form.listingKind],
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId),
    [categories, form.categoryId],
  );

  const metaSubvertical =
    selectedCategory?.metaSubvertical?.trim() ||
    initial?.productCategory?.metaSubvertical?.trim() ||
    null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{ data: CategoryRow[] }>(
          '/product-categories',
        );
        if (!cancelled) setCategories(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadTemplates = useCallback(async (sub: string | null, catId?: string) => {
    if (!sub && !catId) {
      setTemplates([]);
      return;
    }
    try {
      setTemplatesLoading(true);
      const params = new URLSearchParams();
      if (sub) params.set('metaSubvertical', sub);
      if (catId) params.set('categoryId', catId);

      const res = await apiRequest<{ data: TemplateRow[] }>(
        `/product-attribute-templates?${params.toString()}`,
      );
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTemplates([]);
      toast.error('Could not load attribute suggestions for this category.');
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadTemplates(selectedCategory.metaSubvertical?.trim() || null, selectedCategory.id);
    } else {
      setTemplates([]);
    }
  }, [selectedCategory, loadTemplates]);

  useEffect(() => {
    if (!initial || mode !== 'edit') return;
    const pl = initial.price;
    const pu = initial.pricingUnit ?? 'FLAT';
    const attrs: Record<string, string> = {};
    for (const a of initial.attributes ?? []) {
      attrs[a.key] = a.value;
    }
    setForm({
      productName: initial.name ?? '',
      skuRetailerId: initial.sku ?? '',
      brand: initial.brand ?? '',
      description: initial.description ?? '',
      categoryLegacy: initial.category ?? '',
      categoryId: initial.categoryId ?? '',
      price: pl != null && Number.isFinite(Number(pl)) ? String(pl) : '',
      pricingUnit: pu,
      availability: mapAvailabilityToForm(initial.availability || 'in stock'),
      listingKind: inferListingKind(
        initial.listingKind,
        initial.productType ?? 'PRODUCT',
      ),
      onWhatsapp: initial.onWhatsapp ?? false,
      onPos: initial.onPos ?? true,
      onWeb: initial.onWeb ?? false,
      media: (initial.media || [])
        .map((m: any) => ({
          ...m.media,
          isPrimary: m.isPrimary,
          sortOrder: m.sortOrder,
        }))
        .filter(Boolean),
      condition: initial.condition ?? 'NEW',
      gtin: initial.gtin ?? '',
      googleProductCategory: initial.googleProductCategory ?? '',
      salePrice:
        initial.salePrice != null && Number.isFinite(Number(initial.salePrice))
          ? String(initial.salePrice)
          : '',
      duration: initial.duration != null ? String(initial.duration) : '',
      durationType: (initial.durationType as typeof form.durationType) ?? '',
      deliveryMode: (initial.deliveryMode as typeof form.deliveryMode) ?? '',
      bookingNoticeHours:
        initial.bookingNoticeHours != null
          ? String(initial.bookingNoticeHours)
          : '',
      bufferMinutes:
        initial.bufferMinutes != null ? String(initial.bufferMinutes) : '',
      maxBookingsPerSlot:
        initial.maxBookingsPerSlot != null
          ? String(initial.maxBookingsPerSlot)
          : '',
      stock: initial.stock != null ? String(initial.stock) : '',
    });
    setAttrValues(attrs);
  }, [initial, mode]);

  const update = (
    key: keyof typeof form,
    value: string | File | boolean | null | ProductMediaItem[],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildAttributesPayload = (): { key: string; value: string }[] => {
    const map = new Map<string, string>();
    for (const t of templates) {
      const v = (attrValues[t.key] ?? '').trim();
      if (v) map.set(t.key, v);
    }
    for (const [k, v] of Object.entries(attrValues)) {
      const t = v.trim();
      if (t && !map.has(k)) map.set(k, t);
    }
    return [...map.entries()].map(([key, value]) => ({ key, value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.productName.trim())
      nextErrors.productName = 'Product name is required';
    if (!form.skuRetailerId.trim())
      nextErrors.skuRetailerId = 'SKU / Retailer ID is required';
    const priceNum = Number(form.price);
    if (!form.price.trim() || !Number.isFinite(priceNum) || priceNum < 0) {
      nextErrors.price = 'Price must be a valid non-negative number';
    }
    const hasMedia = form.media.length > 0;
    // Meta catalog needs a public HTTPS URL; media library provides this.
    if (form.onWhatsapp && !hasMedia) {
      nextErrors.media =
        'Add media — WhatsApp catalog requires a public image.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix highlighted fields.');
      return;
    }

    if (form.onWhatsapp && !hasMedia) {
      toast.error(
        'WhatsApp catalog needs media: select images from the media library.',
      );
      return;
    }

    const categoryIdTrim = form.categoryId.trim();
    const payload: Record<string, unknown> = {
      name: form.productName.trim(),
      sku: form.skuRetailerId.trim(),
      brand: form.brand.trim() || null,
      description: form.description.trim() || null,
      category: form.categoryLegacy.trim() || null,
      categoryId: categoryIdTrim ? categoryIdTrim : null,
      // Keep imageUrl for backward compatibility, but use primary media URL
      imageUrl: hasMedia
        ? form.media.find((m) => m.isPrimary)?.url || form.media[0]?.url
        : null,
      price: priceNum,
      pricingUnit: form.pricingUnit,
      productType: apiProductType(form.listingKind),
      listingKind: form.listingKind,
      availability: mapAvailabilityToApi(form.availability),
      onWhatsapp: form.onWhatsapp,
      onPos: form.onPos,
      onWeb: form.onWeb,
      condition: form.condition,
      gtin: form.gtin.trim() || null,
      googleProductCategory: form.googleProductCategory.trim() || null,
      salePrice: form.salePrice.trim() ? Number(form.salePrice) : null,
      duration: form.duration.trim()
        ? Number.parseInt(form.duration, 10)
        : null,
      durationType: form.durationType || null,
      deliveryMode: form.deliveryMode || null,
      bookingNoticeHours: form.bookingNoticeHours.trim()
        ? Number.parseInt(form.bookingNoticeHours, 10)
        : null,
      bufferMinutes: form.bufferMinutes.trim()
        ? Number.parseInt(form.bufferMinutes, 10)
        : null,
      maxBookingsPerSlot: form.maxBookingsPerSlot.trim()
        ? Number.parseInt(form.maxBookingsPerSlot, 10)
        : null,
      stock: form.stock.trim() ? Number.parseInt(form.stock, 10) : 0,
      attributes: buildAttributesPayload(),
      media: form.media.map((m, index) => ({
        mediaId: m.id,
        isPrimary: index === 0, // First media is primary
        sortOrder: index,
      })),
    };

    try {
      setSaving(true);
      if (mode === 'create') {
        const res = await apiRequest<{
          data: { id: string };
          warning?: string;
        }>('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (res.warning) toast.warning(res.warning);
        toast.success('Listing saved.');
        router.push('/products');
      } else if (productId) {
        const res = await apiRequest<{
          data: { id: string };
          warning?: string;
        }>(`/products/${productId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        if (res.warning) toast.warning(res.warning);
        toast.success('Listing updated.');
        router.push('/products');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'create' ? copy.pageTitleCreate : copy.pageTitleEdit;
  const submitLabel =
    mode === 'create'
      ? saving
        ? 'Saving…'
        : 'Save listing'
      : saving
        ? 'Updating…'
        : 'Update listing';

  const setListingKind = (kind: ListingKind) => {
    setForm((prev) => ({
      ...prev,
      listingKind: kind,
    }));
  };

  const kindCards: { kind: ListingKind; icon: LucideIcon }[] = [
    { kind: 'PRODUCT', icon: Package },
    { kind: 'SERVICE', icon: Wrench },
    { kind: 'EVENT', icon: CalendarDays },
  ];

  return (
    <main className="p-4 lg:p-6">
      <div className="mx-auto max-w-[980px] rounded-xl border border-[#e7e7e7] bg-white overflow-hidden shadow-sm">
        <div className="border-b border-[#e7e7e7] px-4 lg:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => router.push('/products')}
              className="bg-white border border-[#d9d9d9] text-[#1d1b1c] hover:bg-[#f8f8f8]"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-[#1d1b1c]">
              {title}
            </h1>
          </div>
          <p className="text-[13px] text-[#716f70] max-w-md leading-snug">
            {copy.heroHint}
          </p>
        </div>

        <form onSubmit={submit} className="px-4 lg:px-6 py-5">
          <div className="mb-6">
            <div className={sec}>WHAT ARE YOU LISTING?</div>
            <p className="text-[13px] text-[#716f70] mb-3 leading-snug">
              Choose one — the form, tabs, and hints update to match. Event and
              service listings are stored like services in the catalog until
              your event module links them.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {kindCards.map(({ kind, icon: Icon }) => {
                const kc = formCopyForKind(kind);
                const active = form.listingKind === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setListingKind(kind)}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-left transition-shadow',
                      active
                        ? 'border-[#1b8a59] bg-[#f3faf6] shadow-[0_0_0_1px_rgba(27,138,89,0.25)]'
                        : 'border-[#e2e2e2] bg-white hover:border-[#cfcfcf] hover:bg-[#fafafa]',
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          active
                            ? 'bg-[#1b8a59] text-white'
                            : 'bg-[#f0f0f0] text-[#4b4a4b]',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-[14px] font-semibold text-[#1d1b1c]">
                          {kc.cardTitle}
                        </div>
                        <div className="text-[12px] text-[#716f70] leading-snug mt-0.5">
                          {kc.cardDescription}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Tabs key={form.listingKind} defaultValue="basics" className="w-full">
            <TabsList className="w-full justify-start rounded-xl border border-[#e7e7e7] bg-[#fafafa] p-1 h-auto flex-wrap gap-1 mb-6">
              <TabsTrigger
                value="basics"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1b8a59] data-[state=active]:shadow-sm text-[#4b4a4b]"
              >
                {copy.tabBasics}
              </TabsTrigger>
              <TabsTrigger
                value="catalog"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1b8a59] data-[state=active]:shadow-sm text-[#4b4a4b]"
              >
                {copy.tabCatalog}
              </TabsTrigger>
              {copy.showServiceTab ? (
                <TabsTrigger
                  value="service"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1b8a59] data-[state=active]:shadow-sm text-[#4b4a4b]"
                >
                  {copy.tabService}
                </TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value="basics" className="space-y-6 mt-0">
              <div>
                <div className={sec}>{copy.channelsSectionTitle}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-[13px] text-[#1d1b1c] rounded-xl border border-[#ececec] px-3 py-2.5 bg-[#fafafa]">
                    <input
                      type="checkbox"
                      checked={form.onWhatsapp}
                      onChange={(e) => update('onWhatsapp', e.target.checked)}
                    />
                    WhatsApp
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#1d1b1c] rounded-xl border border-[#ececec] px-3 py-2.5 bg-[#fafafa]">
                    <input
                      type="checkbox"
                      checked={form.onPos}
                      onChange={(e) => update('onPos', e.target.checked)}
                    />
                    POS
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#1d1b1c] rounded-xl border border-[#ececec] px-3 py-2.5 bg-[#fafafa]">
                    <input
                      type="checkbox"
                      checked={form.onWeb}
                      onChange={(e) => update('onWeb', e.target.checked)}
                    />
                    Web
                  </label>
                </div>
              </div>

              <div>
                <div className={sec}>DETAILS</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>{copy.nameLabel} *</label>
                    <input
                      value={form.productName}
                      onChange={(e) => update('productName', e.target.value)}
                      placeholder={copy.namePlaceholder}
                      className={inp}
                    />
                    {errors.productName ? (
                      <p className="mt-1 text-[12px] text-red-600">
                        {errors.productName}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className={lbl}>{copy.skuLabel} *</label>
                    <input
                      value={form.skuRetailerId}
                      onChange={(e) => update('skuRetailerId', e.target.value)}
                      placeholder={copy.skuPlaceholder}
                      className={inp}
                    />
                    {errors.skuRetailerId ? (
                      <p className="mt-1 text-[12px] text-red-600">
                        {errors.skuRetailerId}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className={lbl}>{copy.brandLabel}</label>
                    <input
                      value={form.brand}
                      onChange={(e) => update('brand', e.target.value)}
                      placeholder={copy.brandPlaceholder}
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className={lbl}>{copy.availabilityLabel}</label>
                    <select
                      value={form.availability}
                      onChange={(e) =>
                        update('availability', e.target.value as Availability)
                      }
                      className={inp}
                    >
                      <option value="IN_STOCK">In stock</option>
                      <option value="OUT_OF_STOCK">Out of stock</option>
                      <option value="LOW_STOCK">Low stock</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={lbl}>{copy.descLabel}</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      placeholder={copy.descPlaceholder}
                      rows={3}
                      className={txt}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className={sec}>{copy.priceSectionTitle}</div>
                <p className="text-[12px] text-[#8d8d8d] mb-3">
                  {copy.priceUnitHint}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[640px]">
                  <div>
                    <label className={lbl}>{copy.priceLabel} *</label>
                    <input
                      value={form.price}
                      onChange={(e) => update('price', e.target.value)}
                      placeholder={copy.pricePlaceholder}
                      className={inp}
                    />
                    {errors.price ? (
                      <p className="mt-1 text-[12px] text-red-600">
                        {errors.price}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className={lbl}>Price unit</label>
                    <select
                      value={form.pricingUnit}
                      onChange={(e) =>
                        update(
                          'pricingUnit',
                          e.target.value as typeof form.pricingUnit,
                        )
                      }
                      className={inp}
                    >
                      {form.listingKind === 'PRODUCT' && (
                        <>
                          <option value="FLAT">Flat (Fixed)</option>
                          <option value="PER_KG">Per kg</option>
                          <option value="PER_GRAM">Per gram</option>
                          <option value="PER_PIECE">Per piece</option>
                          <option value="PER_LITER">Per liter</option>
                          <option value="PER_ML">Per ml</option>
                        </>
                      )}
                      {form.listingKind === 'SERVICE' && (
                        <>
                          <option value="FLAT">Flat (Fixed)</option>
                          <option value="PER_HOUR">Per hour</option>
                          <option value="PER_SESSION">Per session</option>
                          <option value="PER_DAY">Per day</option>
                          <option value="PER_MONTH">Per month</option>
                        </>
                      )}
                      {form.listingKind === 'EVENT' && (
                        <>
                          <option value="FLAT">Flat (Fixed)</option>
                          <option value="PER_PERSON">Per person</option>
                          <option value="PER_TABLE">Per table</option>
                          <option value="PER_TICKET">Per ticket</option>
                        </>
                      )}
                    </select>
                  </div>
                  {form.listingKind === 'PRODUCT' && (
                    <div>
                      <label className={lbl}>Stock Quantity</label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => update('stock', e.target.value)}
                        placeholder="e.g. 100"
                        className={inp}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className={sec}>{copy.imageSectionTitle}</div>
                <p className="text-[12px] text-[#716f70] leading-relaxed mb-3">
                  Select images from your media library. WhatsApp catalog
                  requires at least one image.
                </p>
                <div className="rounded-xl border border-dashed border-[#cfcfcf] bg-[#fafafa] p-4">
                  <MediaLibrary
                    multiSelect={true}
                    selectedMedia={form.media}
                    onSelectionChange={(media) =>
                      update('media', media as ProductMediaItem[])
                    }
                  />
                  {errors.media ? (
                    <p className="mt-2 text-[12px] text-red-600">
                      {errors.media}
                    </p>
                  ) : null}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="catalog" className="space-y-6 mt-0">
              <div>
                <div className={sec}>{copy.catalogSectionIntro}</div>
                <p className="text-[12px] text-[#8d8d8d] mb-3">
                  {copy.catalogCategoryHint}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={lbl}>Catalog category (tree)</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => update('categoryId', e.target.value)}
                      className={inp}
                    >
                      <option value="">None — use legacy label only</option>
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {categoryOptionLabel(c)}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 ? (
                      <p className="mt-2 text-[12px] text-[#8d8d8d] leading-relaxed">
                        No categories in the database yet. Seed{' '}
                        <code className="text-[11px] bg-[#f0f0f0] px-1 rounded">
                          ProductCategory
                        </code>{' '}
                        rows or continue with the legacy label below.
                      </p>
                    ) : (
                      <p className="mt-2 text-[12px] text-[#8d8d8d]">
                        {metaSubvertical
                          ? `Templates use vertical: ${metaSubvertical}`
                          : 'This category has no meta subvertical — attribute suggestions are disabled.'}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className={lbl}>Legacy category label</label>
                    <input
                      value={form.categoryLegacy}
                      onChange={(e) => update('categoryLegacy', e.target.value)}
                      placeholder={copy.legacyCategoryPlaceholder}
                      className={inp}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className={sec}>{copy.catalogMetaIntro}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Condition</label>
                    <select
                      value={form.condition}
                      onChange={(e) =>
                        update(
                          'condition',
                          e.target.value as typeof form.condition,
                        )
                      }
                      className={inp}
                    >
                      <option value="NEW">New</option>
                      <option value="REFURBISHED">Refurbished</option>
                      <option value="USED">Used</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>GTIN</label>
                    <input
                      value={form.gtin}
                      onChange={(e) => update('gtin', e.target.value)}
                      placeholder="Barcode / GTIN"
                      className={inp}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lbl}>
                      Google product category (text)
                    </label>
                    <input
                      value={form.googleProductCategory}
                      onChange={(e) =>
                        update('googleProductCategory', e.target.value)
                      }
                      placeholder="Taxonomy path or label for feeds"
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Sale price (optional)</label>
                    <input
                      value={form.salePrice}
                      onChange={(e) => update('salePrice', e.target.value)}
                      placeholder="e.g. 99.00"
                      className={inp}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className={sec}>ATTRIBUTES (FROM TEMPLATES)</div>
                {templatesLoading ? (
                  <p className="text-[13px] text-[#716f70]">
                    Loading suggested fields…
                  </p>
                ) : templates.length === 0 ? (
                  <p className="text-[13px] text-[#716f70] leading-relaxed rounded-xl border border-[#ececec] bg-[#fafafa] px-4 py-3">
                    {copy.attributesEmptyHint}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((t) => (
                      <div key={t.id}>
                        <label className={lbl}>{t.label}</label>
                        <input
                          value={attrValues[t.key] ?? ''}
                          onChange={(e) =>
                            setAttrValues((prev) => ({
                              ...prev,
                              [t.key]: e.target.value,
                            }))
                          }
                          placeholder={
                            t.placeholder || `Enter ${t.label.toLowerCase()}`
                          }
                          className={inp}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {copy.showServiceTab ? (
              <TabsContent value="service" className="space-y-6 mt-0">
                <div
                  className={cn(
                    'rounded-xl border px-4 py-3 text-[13px] mb-2',
                    copy.servicePanelClass,
                    form.listingKind === 'EVENT'
                      ? 'text-[#3d3566]'
                      : 'text-[#2d5a3d]',
                  )}
                >
                  {copy.serviceIntro}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>{copy.durationLabel}</label>
                    <input
                      value={form.duration}
                      onChange={(e) => update('duration', e.target.value)}
                      placeholder={copy.durationPlaceholder}
                      className={inp}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className={lbl}>Duration type</label>
                    <select
                      value={form.durationType}
                      onChange={(e) =>
                        update(
                          'durationType',
                          e.target.value as typeof form.durationType,
                        )
                      }
                      className={inp}
                    >
                      <option value="">—</option>
                      <option value="FIXED">Fixed</option>
                      <option value="VARIABLE">Variable</option>
                      <option value="ONGOING">Ongoing</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Delivery mode</label>
                    <select
                      value={form.deliveryMode}
                      onChange={(e) =>
                        update(
                          'deliveryMode',
                          e.target.value as typeof form.deliveryMode,
                        )
                      }
                      className={inp}
                    >
                      <option value="">—</option>
                      <option value="IN_PERSON">In person</option>
                      <option value="REMOTE">Remote</option>
                      <option value="HOME_VISIT">Home visit</option>
                      <option value="ANY">Any</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Booking notice (hours)</label>
                    <input
                      value={form.bookingNoticeHours}
                      onChange={(e) =>
                        update('bookingNoticeHours', e.target.value)
                      }
                      placeholder={copy.bookingNoticePlaceholder}
                      className={inp}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className={lbl}>Buffer (minutes)</label>
                    <input
                      value={form.bufferMinutes}
                      onChange={(e) => update('bufferMinutes', e.target.value)}
                      placeholder={copy.bufferPlaceholder}
                      className={inp}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className={lbl}>Max bookings per slot</label>
                    <input
                      value={form.maxBookingsPerSlot}
                      onChange={(e) =>
                        update('maxBookingsPerSlot', e.target.value)
                      }
                      placeholder={copy.maxBookingsPlaceholder}
                      className={inp}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {(form.listingKind === 'SERVICE' || form.listingKind === 'EVENT') && (
                  <div className="mt-8 border-t border-[#efefef] pt-6">
                    {mode === 'edit' && productId ? (
                      <>
                        <ServiceAvailabilityManager productId={productId} />
                        {form.listingKind === 'EVENT' && <ServiceZonesPanel productId={productId} />}
                      </>
                    ) : (
                      <div className="bg-[#fff9e6] border border-[#ffe58f] rounded-xl p-4 text-[13px] text-[#856404]">
                        <p className="font-semibold">Almost there!</p>
                        <p>You need to <strong>Save the listing</strong> first before you can start adding availability slots or specific zones.</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ) : null}
          </Tabs>

          <div className="pt-8 mt-2 border-t border-[#efefef] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
            <Button
              type="button"
              onClick={() => router.push('/products')}
              className="bg-white border border-[#d8d8d8] text-[#1d1b1c] hover:bg-[#f8f8f8]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#1da750] hover:bg-[#158a3e] text-white"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
