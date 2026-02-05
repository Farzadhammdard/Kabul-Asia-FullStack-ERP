"use client";
import { useEffect, useMemo, useState } from "react";
import ServiceSection from "@/components/services/ServiceSection";
import { getServices } from "@/lib/api";

function toSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export default function ServiceDynamicPage({ params }) {
  const slug = params?.slug || "";
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        if (!token) {
          setError("برای مشاهده خدمات ابتدا وارد شوید.");
          setLoading(false);
          return;
        }
        const data = await getServices(token);
        setServices(data);
      } catch (e) {
        setError("خطا در دریافت خدمات");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const service = useMemo(() => {
    return services.find((s) => toSlug(s.name) === slug);
  }, [services, slug]);

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-red-300">{error}</div>;
  if (!service) return <div className="text-gray-500">این خدمت یافت نشد.</div>;

  return <ServiceSection title={`مدیریت پروژه‌های ${service.name}`} tag={service.name} />;
}
