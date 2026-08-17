import { redirect } from "next/navigation";
import { Marketplace } from "../components/marketplace";
import { currentAccount } from "../lib/auth";
import { getCreditBalance } from "../lib/credits";

export const dynamic = "force-dynamic";

export default async function Home() {
  const account = await currentAccount();
  if (!account) redirect("/signin?next=/");
  return <Marketplace email={account.email} initialCredits={await getCreditBalance(account.userId)} />;
}
