/**
 * UX layer: three tenant-facing listing kinds. EVENT maps to productType SERVICE in the API until Event models ship.
 */
export type ListingKind = "PRODUCT" | "SERVICE" | "EVENT";

export function inferListingKind(
  stored: ListingKind | null | undefined,
  productType: "PRODUCT" | "SERVICE"
): ListingKind {
  if (stored === "EVENT" || stored === "SERVICE" || stored === "PRODUCT") return stored;
  return productType === "SERVICE" ? "SERVICE" : "PRODUCT";
}

/** Stored productType for Prisma / Meta catalog (EVENT → SERVICE). */
export function apiProductType(kind: ListingKind): "PRODUCT" | "SERVICE" {
  return kind === "PRODUCT" ? "PRODUCT" : "SERVICE";
}

export type FormKindCopy = {
  cardTitle: string;
  cardDescription: string;
  pageTitleCreate: string;
  pageTitleEdit: string;
  heroHint: string;
  nameLabel: string;
  namePlaceholder: string;
  skuLabel: string;
  skuPlaceholder: string;
  brandLabel: string;
  brandPlaceholder: string;
  descLabel: string;
  descPlaceholder: string;
  availabilityLabel: string;
  priceSectionTitle: string;
  priceLabel: string;
  pricePlaceholder: string;
  priceUnitHint: string;
  imageSectionTitle: string;
  channelsSectionTitle: string;
  catalogSectionIntro: string;
  catalogCategoryHint: string;
  legacyCategoryPlaceholder: string;
  catalogMetaIntro: string;
  attributesEmptyHint: string;
  servicePanelClass: string;
  serviceIntro: string;
  durationLabel: string;
  durationPlaceholder: string;
  bookingNoticePlaceholder: string;
  bufferPlaceholder: string;
  maxBookingsPlaceholder: string;
  showServiceTab: boolean;
  tabBasics: string;
  tabCatalog: string;
  tabService: string;
};

export function formCopyForKind(kind: ListingKind): FormKindCopy {
  if (kind === "SERVICE") {
    return {
      cardTitle: "Service",
      cardDescription: "Time-based offers: repairs, consulting, appointments.",
      pageTitleCreate: "Add service",
      pageTitleEdit: "Edit service",
      heroHint:
        "Describe what you deliver, set price (per hour, session, or flat), then add booking rules on the last tab.",
      nameLabel: "Service name",
      namePlaceholder: "e.g. Home plumbing — first hour",
      skuLabel: "Service code / ID",
      skuPlaceholder: "e.g. PLUMB-HR-01",
      brandLabel: "Provider / team name",
      brandPlaceholder: "e.g. City Plumbing Co.",
      descLabel: "What’s included",
      descPlaceholder: "Scope, what the customer should prepare, cancellation policy…",
      availabilityLabel: "Availability label",
      priceSectionTitle: "PRICING",
      priceLabel: "Price (NPR)",
      pricePlaceholder: "e.g. 1500.00",
      priceUnitHint: "Use per hour or per session when it matches how you bill.",
      imageSectionTitle: "IMAGE",
      channelsSectionTitle: "TYPE & CHANNELS",
      catalogSectionIntro: "CATEGORY",
      catalogCategoryHint:
        "Optional. Link a category to pull suggested fields (e.g. health, home). Skip if irrelevant.",
      legacyCategoryPlaceholder: "e.g. Home services",
      catalogMetaIntro: "CATALOG / META FIELDS",
      attributesEmptyHint:
        "Optional extras (dimensions, certifications). Skip if you don’t need structured fields.",
      servicePanelClass: "border-[#e8efe9] bg-[#f6fbf7]",
      serviceIntro:
        "Set how long a booking runs, how much notice you need, and whether it’s in person or remote.",
      durationLabel: "Duration (minutes)",
      durationPlaceholder: "e.g. 60",
      bookingNoticePlaceholder: "e.g. 24",
      bufferPlaceholder: "e.g. 15",
      maxBookingsPlaceholder: "e.g. 1",
      showServiceTab: true,
      tabBasics: "Basics & pricing",
      tabCatalog: "Catalog & attributes",
      tabService: "Booking & delivery",
    };
  }

  if (kind === "EVENT") {
    return {
      cardTitle: "Event",
      cardDescription: "Exhibitions, booths, sponsorships — bookable packages.",
      pageTitleCreate: "Add event offering",
      pageTitleEdit: "Edit event offering",
      heroHint:
        "List booth blocks, sponsor tiers, or packages. Full event builder (venues, maps) can plug in later; this listing still uses your normal price, invoice, and payment flow.",
      nameLabel: "Offering name",
      namePlaceholder: "e.g. Gold sponsor — Tech Expo 2026",
      skuLabel: "Reference ID",
      skuPlaceholder: "e.g. EXPO26-GOLD",
      brandLabel: "Organizer / brand",
      brandPlaceholder: "e.g. Expo Nepal Pvt. Ltd.",
      descLabel: "Scope & details",
      descPlaceholder:
        "Venue, dates, what’s included (logo placement, booth size, passes). This text can sync to channels until a dedicated event module is enabled.",
      availabilityLabel: "Status label",
      priceSectionTitle: "PRICING",
      priceLabel: "Package price (NPR)",
      pricePlaceholder: "e.g. 350000.00",
      priceUnitHint: "Often flat or per session for a sponsor tier; pick the unit that matches your contract.",
      imageSectionTitle: "IMAGE / CREATIVE",
      channelsSectionTitle: "TYPE & CHANNELS",
      catalogSectionIntro: "CATEGORY & VISIBILITY",
      catalogCategoryHint:
        "Optional. Use catalog categories for structured add-ons; event-specific inventory can link here later.",
      legacyCategoryPlaceholder: "e.g. Event — sponsorship",
      catalogMetaIntro: "CATALOG / META FIELDS",
      attributesEmptyHint:
        "Add structured fields when templates apply (e.g. booth size). Otherwise leave blank.",
      servicePanelClass: "border-[#ede8f5] bg-[#f7f5fc]",
      serviceIntro:
        "Booking-style fields for this package: slot length, on-site vs remote setup, buffers between bookings.",
      durationLabel: "Slot / package duration (minutes)",
      durationPlaceholder: "e.g. 1440 (full day)",
      bookingNoticePlaceholder: "e.g. 72 (hours before event)",
      bufferPlaceholder: "e.g. 60",
      maxBookingsPlaceholder: "e.g. 4 (max sponsors at this tier)",
      showServiceTab: true,
      tabBasics: "Basics & pricing",
      tabCatalog: "Catalog & extras",
      tabService: "Booking & slots",
    };
  }

  return {
    cardTitle: "Product",
    cardDescription: "Physical goods: retail, wholesale, inventory.",
    pageTitleCreate: "Add product",
    pageTitleEdit: "Edit product",
    heroHint:
      "Set name, SKU, price, and channels. Use Catalog for categories and suggested attributes (size, weight, etc.).",
    nameLabel: "Product name",
    namePlaceholder: "e.g. Organic basmati rice 5kg",
    skuLabel: "SKU / Retailer ID",
    skuPlaceholder: "e.g. RICE-5KG-01",
    brandLabel: "Brand",
    brandPlaceholder: "e.g. Khetipati",
    descLabel: "Description",
    descPlaceholder: "Ingredients, weight, storage, shelf life…",
    availabilityLabel: "Availability",
    priceSectionTitle: "PRICING",
    priceLabel: "Price (NPR)",
    pricePlaceholder: "e.g. 450.00",
    priceUnitHint: "Flat is typical for retail SKUs.",
    imageSectionTitle: "PRODUCT IMAGE",
    channelsSectionTitle: "TYPE & CHANNELS",
    catalogSectionIntro: "CATEGORY",
    catalogCategoryHint:
      "Pick a leaf category to load suggested attributes. Or use legacy text if your tree is empty.",
    legacyCategoryPlaceholder: "e.g. Vegetables",
    catalogMetaIntro: "CATALOG / META FIELDS",
    attributesEmptyHint:
      "Select a category with a meta vertical to see fields like storage, allergens, or dimensions.",
    servicePanelClass: "border-[#e8efe9] bg-[#f6fbf7]",
    serviceIntro:
      "For physical products you usually skip this tab. Switch to Service or Event if this row is bookable.",
    durationLabel: "Duration (minutes)",
    durationPlaceholder: "e.g. 60",
    bookingNoticePlaceholder: "e.g. 24",
    bufferPlaceholder: "e.g. 15",
    maxBookingsPlaceholder: "e.g. 1",
    showServiceTab: false,
    tabBasics: "Basics & pricing",
    tabCatalog: "Catalog & attributes",
    tabService: "Service",
  };
}
