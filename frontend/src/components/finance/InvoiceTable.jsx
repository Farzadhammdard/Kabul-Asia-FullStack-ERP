"use client";
import { useEffect, useMemo, useState } from "react";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getServices,
} from "@/lib/api";

const DEFAULT_ITEM = { service: "", quantity: 1, price: "" };

function getUnitLabel(serviceName = "") {
  const name = String(serviceName).toLowerCase();
  if (name.includes("cutting")) return "تخته";
  return "متر";
}

function getQuantityPlaceholder(serviceName = "") {
  return getUnitLabel(serviceName) === "تخته" ? "تعداد تخته" : "متراژ (متر)";
}

function getPricePlaceholder(serviceName = "") {
  return getUnitLabel(serviceName) === "تخته" ? "قیمت فی تخته" : "قیمت فی متر";
}

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    customer_name: "",
    items: [{ ...DEFAULT_ITEM }],
  });

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("برای مشاهده فاکتورها ابتدا وارد شوید.");
        setLoading(false);
        return;
      }
      const [data, svc] = await Promise.all([
        getInvoices(token),
        getServices(token),
      ]);
      setInvoices(data);
      setServices(svc);
    } catch (e) {
      setError("خطا در دریافت فاکتورها");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const serviceMap = useMemo(() => {
    return new Map(services.map((s) => [String(s.id), s]));
  }, [services]);

  const formTotal = useMemo(() => {
    return form.items.reduce((sum, item) => {
      const price = Number(item.price || serviceMap.get(String(item.service))?.price || 0);
      return sum + Number(item.quantity || 0) * price;
    }, 0);
  }, [form.items, serviceMap]);

  function updateItem(index, patch) {
    setForm((prev) => {
      const next = [...prev.items];
      next[index] = { ...next[index], ...patch };
      return { ...prev, items: next };
    });
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...DEFAULT_ITEM }],
    }));
  }

  function removeItem(index) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({ customer_name: "", items: [{ ...DEFAULT_ITEM }] });
  }

  async function onCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        customer_name: form.customer_name,
        items: form.items
          .filter((i) => i.service && i.quantity)
          .map((i) => ({
            service: Number(i.service),
            quantity: Number(i.quantity),
            price: Number(i.price || serviceMap.get(String(i.service))?.price || 0),
          })),
      };
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      await createInvoice(payload, token);
      resetForm();
      load();
    } catch (e) {
      setError("ایجاد فاکتور ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      const payload = {
        customer_name: form.customer_name,
        items: form.items
          .filter((i) => i.service && i.quantity)
          .map((i) => ({
            service: Number(i.service),
            quantity: Number(i.quantity),
            price: Number(i.price || serviceMap.get(String(i.service))?.price || 0),
          })),
      };
      await updateInvoice(editingId, payload, token);
      resetForm();
      load();
    } catch (e) {
      setError("ویرایش فاکتور ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      await deleteInvoice(id, token);
      if (editingId === id) resetForm();
      load();
    } catch (e) {
      setError("حذف فاکتور ناموفق بود");
    }
  }

  function startEdit(inv) {
    setEditingId(inv.id);
    setForm({
      customer_name: inv.customer_name || "",
      items: (inv.items || []).map((item) => ({
        service: String(item.service || ""),
        quantity: item.quantity || 1,
        price: item.price || "",
      })),
    });
  }

  function printInvoice(inv) {
    if (typeof window === "undefined") return;
    const popup = window.open("", "_blank", "width=900,height=650");
    if (!popup) return;

    const currency = "AFN";
    const rows = (inv.items || [])
      .map((item, index) => {
        const service = serviceMap.get(String(item.service));
        const serviceName = item.service_name || service?.name || "-";
        const unit = getUnitLabel(serviceName);
        const total = Number(item.quantity || 0) * Number(item.price || 0);
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${serviceName}</td>
            <td>${item.quantity} ${unit}</td>
            <td>${Number(item.price || 0).toLocaleString("fa-AF")}</td>
            <td>${total.toLocaleString("fa-AF")}</td>
          </tr>
        `;
      })
      .join("");

    const createdAt = inv.created_at ? new Date(inv.created_at).toLocaleDateString("fa-AF") : "";

    popup.document.write(`
      <!doctype html>
      <html lang="fa" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>چاپ فاکتور</title>
          <style>
            body { font-family: Tahoma, Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { font-size: 20px; margin: 0 0 12px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px; color: #334155; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #cbd5f5; padding: 8px; text-align: center; }
            th { background: #f8fafc; }
            .total { margin-top: 16px; font-weight: bold; font-size: 14px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>فاکتور خدمات</h1>
          <div class="meta">
            <div>نام مشتری: ${inv.customer_name || "-"}</div>
            <div>تاریخ: ${createdAt}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>خدمت</th>
                <th>مقدار</th>
                <th>قیمت</th>
                <th>جمع</th>
              </tr>
            </thead>
            <tbody>
              ${rows || "<tr><td colspan='5'>آیتمی ثبت نشده است.</td></tr>"}
            </tbody>
          </table>
          <div class="total">مبلغ نهایی: ${currency} ${Number(inv.total_amount || 0).toLocaleString("fa-AF")}</div>
          <script>window.focus(); window.print();</script>
        </body>
      </html>
    `);
    popup.document.close();
  }

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="text-red-400 bg-red-500/10 p-3 rounded">{error}</div>}

      <form onSubmit={editingId ? onUpdate : onCreate} className="bg-[#0e1627] p-6 md:p-8 rounded-[28px] space-y-6 shadow-2xl border border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-amber-300">{editingId ? "ویرایش فاکتور" : "صدور فاکتور جدید"}</h3>
          {editingId && (
            <button type="button" className="text-xs text-gray-400" onClick={resetForm}>
              انصراف
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs mb-1 text-gray-400">نام مشتری یا پروژه</label>
            <input
              className="w-full bg-[#0b1220] border border-[#1c2a45] rounded-full px-4 py-3 outline-none"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              placeholder="مثال: جابی صاحب نظری"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-3 rounded-full w-full shadow-lg"
            >
              {saving ? "در حال ذخیره..." : editingId ? "ثبت ویرایش" : "ثبت فاکتور"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm text-gray-300">اقلام فاکتور</h4>
            <button type="button" onClick={addItem} className="text-xs text-amber-300">افزودن آیتم</button>
          </div>
          {form.items.map((item, index) => {
            const service = serviceMap.get(String(item.service));
            const serviceName = service?.name || "";
            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0b1220] border border-[#1d2a47] rounded-2xl p-4">
                <select
                  className="bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
                  value={item.service}
                  onChange={(e) => {
                    const selected = e.target.value;
                    const price = serviceMap.get(String(selected))?.price || "";
                    updateItem(index, { service: selected, price });
                  }}
                >
                  <option value="">انتخاب خدمت</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  className="bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
                  type="number"
                  min="1"
                  placeholder={getQuantityPlaceholder(serviceName)}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: e.target.value })}
                />
                <input
                  className="bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
                  type="number"
                  min="0"
                  placeholder={getPricePlaceholder(serviceName)}
                  value={item.price}
                  onChange={(e) => updateItem(index, { price: e.target.value })}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    مبلغ: {Number(item.quantity || 0) * Number(item.price || service?.price || 0)}
                  </span>
                  <button type="button" onClick={() => removeItem(index)} className="text-xs text-red-400">
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
          {services.length === 0 && (
            <div className="text-xs text-amber-300">هیچ خدمتی پیدا نشد. ابتدا خدمات را تعریف کنید.</div>
          )}

          <div className="bg-[#0b1220] border border-dashed border-[#223055] rounded-2xl p-4 flex items-center justify-between">
            <div className="text-xs text-gray-400">مبلغ نهایی فاکتور</div>
            <div className="text-amber-300 font-extrabold">AFN {Number(formTotal || 0).toLocaleString("fa-AF")}</div>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="bg-[#0b1220] border border-[#1d2a47] rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                #
              </div>
              <div>
                <div className="text-sm text-gray-200">{inv.customer_name}</div>
                <div className="text-xs text-gray-500">{new Date(inv.created_at).toLocaleDateString("fa-AF")}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-amber-300 font-bold text-sm">AFN {Number(inv.total_amount || 0).toLocaleString("fa-AF")}</div>
              <button
                onClick={() => printInvoice(inv)}
                className="w-8 h-8 rounded-full bg-white/5 text-amber-200"
                title="چاپ"
              >
                ⎙
              </button>
              <button
                onClick={() => startEdit(inv)}
                className="w-8 h-8 rounded-full bg-white/5 text-sky-300"
                title="ویرایش"
              >
                ✎
              </button>
              <button onClick={() => onDelete(inv.id)} className="w-8 h-8 rounded-full bg-white/5 text-red-300" title="حذف">
                ×
              </button>
            </div>
          </div>
        ))}
        {invoices.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            فاکتوری ثبت نشده است.
          </div>
        )}
      </div>
    </div>
  );
}
