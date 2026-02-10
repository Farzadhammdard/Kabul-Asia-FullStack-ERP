"use client";
import ServiceSection from "@/components/services/ServiceSection";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function CncServicePage() {
  const { t } = useI18n();
  return <ServiceSection title={`${t("serviceProjects")} CNC`} tag="CNC" />;
}
