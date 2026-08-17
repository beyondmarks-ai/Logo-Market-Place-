import { AccountNav } from "../../components/account-nav"; import { PricingClient } from "../../components/pricing-client"; import { billingConfigured } from "../../lib/billing";
export default function PricingPage() { return <main className="pricing-shell"><AccountNav /><PricingClient enabled={billingConfigured()} /></main>; }
