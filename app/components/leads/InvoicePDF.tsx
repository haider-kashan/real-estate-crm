import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a nice font (Optional, standard Helvetica is used here for safety)
// Font.register({ family: 'Open Sans', src: '...' });

// DARK THEME PROFESSIONAL STYLES
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', fontFamily: 'Helvetica', paddingBottom: 60 },
  
  // 1. TOP HEADER (Dark Blue Background like reference)
  headerContainer: { backgroundColor: '#1e293b', flexDirection: 'row', padding: 30, paddingBottom: 40, alignItems: 'flex-start' },
  
  // Left: Logo & Agency Name
  headerLeft: { flexGrow: 1 },
  logoBox: { width: 40, height: 40, backgroundColor: '#FFFFFF', marginBottom: 10, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' }, // Fake Logo text
  agencyName: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  
  // Right: Invoice Label
  headerRight: { alignItems: 'flex-end' },
  title: { fontSize: 32, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  invoiceDetail: { fontSize: 9, color: '#94a3b8', marginTop: 4 },

  // 2. INFO SECTION (Gray Background Strip)
  infoContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 20, paddingHorizontal: 30 },
  infoCol: { width: '33%' },
  label: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' },
  text: { fontSize: 10, color: '#334155', lineHeight: 1.4 },
  textBold: { fontSize: 10, color: '#0f172a', fontWeight: 'bold' },

  // 3. PROPERTY SUBJECT LINE
  subjectContainer: { marginHorizontal: 30, marginTop: 25, marginBottom: 15 },
  subjectLabel: { fontSize: 9, color: '#64748b', marginBottom: 3 },
  subjectText: { fontSize: 11, color: '#0f172a', fontWeight: 'bold', backgroundColor: '#f8fafc', padding: 8, borderLeftWidth: 4, borderLeftColor: '#1e293b' },

  // 4. TABLE
  tableContainer: { marginHorizontal: 30, marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 8, alignItems: 'center' },
  th: { color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' },
  
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: 10, alignItems: 'center' },
  td: { fontSize: 10, color: '#334155' },
  
  // Width Utilities
  w10: { width: '10%', textAlign: 'center' },
  w60: { width: '60%' },
  w30: { width: '30%', textAlign: 'right' },

  // 5. TOTALS
  totalSection: { flexDirection: 'row', justifyContent: 'flex-end', marginHorizontal: 30, marginTop: 10 },
  totalBox: { width: '40%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  totalLabel: { fontSize: 10, color: '#64748b' },
  totalValue: { fontSize: 10, color: '#0f172a', fontWeight: 'bold', textAlign: 'right' },
  grandTotal: { backgroundColor: '#1e293b', padding: 8, flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  grandTotalText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },

  // 6. FOOTER & SIGNATURE
  footerContainer: { position: 'absolute', bottom: 40, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  notesBox: { width: '55%' },
  noteTitle: { fontSize: 9, fontWeight: 'bold', marginBottom: 4 },
  noteText: { fontSize: 8, color: '#64748b', lineHeight: 1.4 },
  
  signBox: { width: '35%', alignItems: 'center' },
  signLine: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 5, height: 30 },
  signLabel: { fontSize: 9, color: '#000', fontWeight: 'bold' },
});

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);

interface InvoicePDFProps {
  data: {
    invoiceNo: string;
    date: string;
    agencyName: string;
    agencyPhone: string;
    agencyEmail: string;
    clientName: string;
    clientPhone: string;
    propertyRef: string;
    items: { description: string; amount: number }[]; // Dynamic Items
    total: number;
  }
}

export default function InvoicePDF({ data }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* 1. DARK HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            {/* Fake Logo Placeholder */}
            <View style={styles.logoBox}><Text style={styles.logoText}>X</Text></View>
            <Text style={styles.agencyName}>{data.agencyName}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceDetail}>NO: {data.invoiceNo}</Text>
            <Text style={styles.invoiceDetail}>DATE: {data.date}</Text>
          </View>
        </View>

        {/* 2. BILL TO / FROM SECTION */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>From (Agency)</Text>
            <Text style={styles.textBold}>{data.agencyName}</Text>
            <Text style={styles.text}>{data.agencyEmail}</Text>
            <Text style={styles.text}>{data.agencyPhone}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Bill To (Client)</Text>
            <Text style={styles.textBold}>{data.clientName}</Text>
            <Text style={styles.text}>{data.clientPhone}</Text>
          </View>
          <View style={styles.infoCol}>
            {/* Empty for spacing or payment info */}
          </View>
        </View>

        {/* 3. PROPERTY REFERENCE */}
        <View style={styles.subjectContainer}>
          <Text style={styles.subjectLabel}>Subject / Property Reference</Text>
          <Text style={styles.subjectText}>{data.propertyRef}</Text>
        </View>

        {/* 4. TABLE */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.w10]}>#</Text>
            <Text style={[styles.th, styles.w60]}>Description</Text>
            <Text style={[styles.th, styles.w30]}>Total (PKR)</Text>
          </View>

          {/* Dynamic Rows */}
          {data.items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.td, styles.w10]}>{index + 1}</Text>
              <Text style={[styles.td, styles.w60]}>{item.description}</Text>
              <Text style={[styles.td, styles.w30]}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* 5. TOTALS SECTION */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.total)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalText}>Grand Total</Text>
              <Text style={styles.grandTotalText}>{formatCurrency(data.total)}</Text>
            </View>
          </View>
        </View>

        {/* 6. FOOTER & SIGNATURE */}
        <View style={styles.footerContainer}>
          <View style={styles.notesBox}>
            <Text style={styles.noteTitle}>Notes:</Text>
            <Text style={styles.noteText}>1. Payment is due within 7 days.</Text>
            <Text style={styles.noteText}>2. Please make cheques payable to "{data.agencyName}".</Text>
            <Text style={[styles.noteText, { marginTop: 10, fontStyle: 'italic' }]}>Thank you for your business!</Text>
          </View>
          
          <View style={styles.signBox}>
            <View style={styles.signLine} /> 
            {/* The line above is blank for digital/physical signature */}
            <Text style={styles.signLabel}>Authorized Signature</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}