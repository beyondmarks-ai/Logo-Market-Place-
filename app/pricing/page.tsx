import { AccountNav } from "../../components/account-nav"; import { PricingClient } from "../../components/pricing-client";
export const dynamic = "force-dynamic";
export default function PricingPage() { return <main className="pricing-shell"><AccountNav /><PricingClient /></main>; }
