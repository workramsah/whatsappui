import React from "react"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

interface InvoicePDFProps {
  invoiceNo: string
  order: {
    id: string
    createdAt: Date | string
  }
  customer: {
    name: string
    email: string | null
    phone: string | null
    address: string | null
  } | null
  items: Array<{
    productNameText: string
    qty: number | string
    unit: string
    unitPrice: number | string
    lineTotal: number | string
  }>
  subtotal: number
  total: number
  issuedAt: Date
  seller?: {
    companyName?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    logoUrl?: string | null
    taxId?: string | null
    invoiceFooterNote?: string | null
  } | null
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#111",
  },
  // Header section
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: "1pt solid #e2e8f0",
  },
  headerLeft: {
    flex: 1,
    minWidth: 220,
  },
  headerRight: {
    flex: 1,
    minWidth: 220,
    alignItems: "flex-end",
  },
  logo: {
    height: 48,
    marginBottom: 8,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "semibold",
    marginBottom: 8,
    color: "#111",
  },
  companyAddress: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#333",
    marginBottom: 4,
  },
  companyContact: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 8,
    color: "#111",
  },
  invoiceMeta: {
    fontSize: 12,
    marginBottom: 4,
    color: "#111",
  },
  invoiceMetaValue: {
    fontWeight: "medium",
  },
  // Bill To section
  billToSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: "1pt solid #e2e8f0",
  },
  billToLeft: {
    flex: 1,
    minWidth: 240,
  },
  billToRight: {
    flex: 1,
    minWidth: 240,
    alignItems: "flex-end",
  },
  billToLabel: {
    fontSize: 12,
    fontWeight: "semibold",
    marginBottom: 4,
    color: "#111",
  },
  customerName: {
    fontSize: 14,
    fontWeight: "medium",
    marginBottom: 4,
    color: "#111",
  },
  customerAddress: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#333",
    marginBottom: 4,
  },
  customerContact: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    marginBottom: 4,
    color: "#111",
  },
  // Items table
  itemsSection: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottom: "1pt solid #e2e8f0",
    marginBottom: 0,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "semibold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 8,
  },
  tableRowEven: {
    backgroundColor: "#f9f9f9",
  },
  colDescription: {
    width: "50%",
    paddingRight: 8,
  },
  colQty: {
    width: "16.67%",
    textAlign: "right",
  },
  colRate: {
    width: "16.67%",
    textAlign: "right",
  },
  colAmount: {
    width: "16.67%",
    textAlign: "right",
  },
  itemDescription: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#111",
  },
  itemValue: {
    fontSize: 12,
    fontWeight: "medium",
    color: "#111",
    fontVariantNumeric: "tabular-nums",
  },
  itemAmount: {
    fontSize: 12,
    fontWeight: "semibold",
    color: "#111",
    fontVariantNumeric: "tabular-nums",
  },
  // Summary section
  summarySection: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  summaryBox: {
    width: "33.33%",
    minWidth: 200,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#333",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "medium",
    color: "#111",
    fontVariantNumeric: "tabular-nums",
  },
  summaryTotal: {
    fontSize: 14,
    fontWeight: "semibold",
    color: "#111",
    fontVariantNumeric: "tabular-nums",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 8,
    borderTop: "2pt solid #111",
  },
  // Notes section
  notesSection: {
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: "semibold",
    marginBottom: 4,
    color: "#111",
  },
  notesText: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#333",
  },
  // Footer
  footer: {
    paddingTop: 16,
    borderTop: "1pt solid #e2e8f0",
    marginTop: 16,
  },
  footerText: {
    fontSize: 10,
    color: "#333",
  },
})

export function InvoicePDFDocument({
  invoiceNo,
  order,
  customer,
  items,
  subtotal,
  total,
  issuedAt,
  seller,
}: InvoicePDFProps): React.ReactElement {
  const companyName = seller?.companyName
  const companyAddress = seller?.address ? seller.address.split('\n').filter(Boolean) : []
  const companyContact = [
    seller?.phone && `Phone: ${seller.phone}`,
    seller?.email && `Email: ${seller.email}`,
  ].filter(Boolean).join(' · ') || null
  
  const customerAddress = customer?.address ? customer.address.split('\n').filter(Boolean) : []
  const customerContact = [
    customer?.phone && `Phone: ${customer.phone}`,
    customer?.email && `Email: ${customer.email}`,
  ].filter(Boolean).join(' · ') || null
  
  const invoiceDate = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Convert relative logo URL to absolute URL for PDF generation
  // If logoUrl is a relative path, it needs to be converted to an absolute URL
  // For server-side PDF generation, we'll handle this in the API route
  const logoUrl = seller?.logoUrl

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerLeft}>
            {logoUrl && (
              <Image src={logoUrl} style={styles.logo} />
            )}
            {companyName && (
              <Text style={styles.companyName}>{companyName}</Text>
            )}
            {companyAddress.length > 0 && (
              <View>
                {companyAddress.map((line, idx) => (
                  <Text key={idx} style={styles.companyAddress}>{line}</Text>
                ))}
              </View>
            )}
            {companyContact && (
              <Text style={styles.companyContact}>{companyContact}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            {invoiceNo && (
              <Text style={styles.invoiceMeta}>
                Invoice No: <Text style={styles.invoiceMetaValue}>{invoiceNo}</Text>
              </Text>
            )}
            <Text style={styles.invoiceMeta}>
              Invoice Date: <Text style={styles.invoiceMetaValue}>{invoiceDate}</Text>
            </Text>
          </View>
        </View>

        {/* Bill To Section */}
        <View style={styles.billToSection}>
          <View style={styles.billToLeft}>
            {customer?.name && (
              <>
                <Text style={styles.billToLabel}>Bill To</Text>
                <Text style={styles.customerName}>{customer.name}</Text>
              </>
            )}
            {customerAddress.length > 0 && (
              <View>
                {customerAddress.map((line, idx) => (
                  <Text key={idx} style={styles.customerAddress}>{line}</Text>
                ))}
              </View>
            )}
            {customerContact && (
              <Text style={styles.customerContact}>{customerContact}</Text>
            )}
          </View>
          <View style={styles.billToRight}>
            {/* Status and payment method can go here if needed */}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.itemsSection}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Item Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>
          {items.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow,
                ...(index % 2 === 1 ? [styles.tableRowEven] : [])
              ]}
            >
              <Text style={[styles.colDescription, styles.itemDescription]}>
                {item.productNameText}
              </Text>
              <Text style={[styles.colQty, styles.itemValue]}>
                {Number(item.qty).toFixed(3)}
              </Text>
              <Text style={[styles.colRate, styles.itemValue]}>
                Rs.{Number(item.unitPrice).toFixed(2)}
              </Text>
              <Text style={[styles.colAmount, styles.itemAmount]}>
                Rs.{Number(item.lineTotal).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Rs.{subtotal.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={[styles.summaryValue, styles.summaryTotal]}>Rs.{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {seller?.invoiceFooterNote && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{seller.invoiceFooterNote}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>This is a system-generated invoice.</Text>
        </View>
      </Page>
    </Document>
  )
}
