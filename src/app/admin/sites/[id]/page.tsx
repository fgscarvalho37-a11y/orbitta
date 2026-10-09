"use client";

import { useParams } from "next/navigation";
import SiteProjectConversation from "@/components/site-projects/SiteProjectConversation";

export default function AdminSiteProjectPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return Number.isSafeInteger(id) && id > 0
    ? <SiteProjectConversation id={id} admin />
    : <main className="p-8 text-white">Projeto inválido.</main>;
}
