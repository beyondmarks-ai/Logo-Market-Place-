import { redirect } from "next/navigation"; import { AdminClient } from "../../components/admin-client"; import { currentAccount } from "../../lib/auth";
export const dynamic = "force-dynamic";
export default async function AdminPage() { const account = await currentAccount(); if (!account) redirect("/signin"); if (account.role !== "admin") redirect("/dashboard"); return <AdminClient />; }
