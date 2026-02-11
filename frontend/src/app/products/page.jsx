"use client";
import { useEffect, useState } from "react";
import { createProduct, deleteProduct, getProducts, updateProduct } from "@/lib/api";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { showToast } from "@/lib/toast";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-[#0e1627] shadow-2xl border border-[#121a2c] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", quantity: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
        setError("برای مدیریت محصولات ابتدا وارد شوید.");
        setLoading(false);
        return;
      }
      const data = await getProducts(token);

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data?.results) {
        setProducts(data.results);
      } else {
        setProducts([]);
      }
    } catch (e) {
      setError("خطا در دریافت محصولات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      await createProduct(
        {
          name: form.name,
          price: Number(form.price || 0),
          quantity: Number(form.quantity || 0),
        },
        token
      );
      setForm({ name: "", price: "", quantity: "" });
      showToast("محصول با موفقیت ثبت شد.");
      load();
    } catch (e) {
      setError("ایجاد محصول ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      await updateProduct(
        editing.id,
        {
          name: editing.name,
          price: Number(editing.price || 0),
          quantity: Number(editing.quantity || 0),
        },
        token
      );
      setEditing(null);
      showToast("ویرایش محصول با موفقیت انجام شد.");
      load();
    } catch (e) {
      setError("ویرایش محصول ناموفق بود");
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
      await deleteProduct(id, token);
      load();
    } catch (e) {
      setError("حذف محصول ناموفق بود");
    }
  }

  if (loading) return <LoadingSkeleton className="mx-auto" />;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">محصولات</h2>

      {error && <div className="text-red-400 bg-red-500/10 p-3 rounded">{error}</div>}

      <Card>
        <form onSubmit={editing ? onUpdate : onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1 text-gray-400">نام محصول</label>
            <input
              className="w-full bg-[#0b1220] border border-gray-700 rounded px-3 py-2 outline-none"
              value={editing ? editing.name : form.name}
              onChange={(e) =>
                editing
                  ? setEditing({ ...editing, name: e.target.value })
                  : setForm({ ...form, name: e.target.value })
              }
              placeholder="مثال: MDF سفید"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-400">قیمت</label>
            <input
              type="number"
              className="w-full bg-[#0b1220] border border-gray-700 rounded px-3 py-2 outline-none"
              value={editing ? editing.price : form.price}
              onChange={(e) =>
                editing
                  ? setEditing({ ...editing, price: e.target.value })
                  : setForm({ ...form, price: e.target.value })
              }
              placeholder="افغانی"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-400">موجودی</label>
            <input
              type="number"
              className="w-full bg-[#0b1220] border border-gray-700 rounded px-3 py-2 outline-none"
              value={editing ? editing.quantity : form.quantity}
              onChange={(e) =>
                editing
                  ? setEditing({ ...editing, quantity: e.target.value })
                  : setForm({ ...form, quantity: e.target.value })
              }
              placeholder="تعداد"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-400 text-black font-bold px-4 py-2 rounded w-full flex items-center justify-center gap-2"
            >
              {saving && <span className="spinner" />}
              {saving ? "در حال ذخیره..." : editing ? "ثبت ویرایش" : "افزودن محصول"}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="text-xs text-gray-400">
                انصراف
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-[#1e293b]">
                <th className="p-2">#</th>
                <th className="p-2">نام</th>
                <th className="p-2">قیمت</th>
                <th className="p-2">موجودی</th>
                <th className="p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p.id} className="border-b border-gray-800">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-amber-300">?? {Number(p.price || 0).toLocaleString("fa-AF")}</td>
                  <td className="p-2">{p.quantity}</td>
                  <td className="p-2 space-x-2 space-x-reverse">
                    <button
                      onClick={() => setEditing({ id: p.id, name: p.name, price: p.price, quantity: p.quantity })}
                      className="text-sky-400 hover:text-sky-300"
                    >
                      ویرایش
                    </button>
                    <button onClick={() => onDelete(p.id)} className="text-red-400 hover:text-red-300">
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-6">محصولی ثبت نشده است.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
