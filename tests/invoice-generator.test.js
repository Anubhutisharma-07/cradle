import { test } from "node:test";
import assert from "node:assert/strict";
import InvoiceEngine from "../projects/productivity/invoice-generator/invoiceEngine.js";

test("formatCurrency formats multi-currency numbers accurately", () => {
  assert.equal(InvoiceEngine.formatCurrency(1250.5, "USD"), "$1,250.50");
  assert.equal(InvoiceEngine.formatCurrency(500, "EUR"), "€500.00");
  assert.equal(InvoiceEngine.formatCurrency(99.9, "GBP"), "£99.90");
});

test("calculateLineTotal computes quantity * unitPrice correctly", () => {
  assert.equal(InvoiceEngine.calculateLineTotal(5, 20), 100);
  assert.equal(InvoiceEngine.calculateLineTotal(0, 100), 0);
  assert.equal(InvoiceEngine.calculateLineTotal(-2, 50), 0);
});

test("calculateInvoiceTotals computes subtotal, tax, discount, and grand total", () => {
  const items = [
    { quantity: 2, unitPrice: 100 },
    { quantity: 1, unitPrice: 300 },
  ]; // subtotal = 500

  const totals = InvoiceEngine.calculateInvoiceTotals(items, 10, 5);
  // tax = 50 (10%), discount = 25 (5%), total = 525
  assert.equal(totals.subtotal, 500);
  assert.equal(totals.taxAmount, 50);
  assert.equal(totals.discountAmount, 25);
  assert.equal(totals.grandTotal, 525);
});

test("serializeInvoice and parseInvoiceJSON round-trip successfully", () => {
  const invoice = { invoiceNumber: "INV-1001", total: 500 };
  const json = InvoiceEngine.serializeInvoice(invoice);
  const { data, error } = InvoiceEngine.parseInvoiceJSON(json);

  assert.equal(error, null);
  assert.equal(data.invoiceNumber, "INV-1001");
});
