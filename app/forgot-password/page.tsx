import { AccountNav } from "../../components/account-nav"; import { AuthForm } from "../../components/auth-form"; import { BackgroundAnimation } from "../../components/background-animation";
export default function ForgotPage() { return <main className="account-shell"><BackgroundAnimation /><AccountNav /><AuthForm mode="forgot" /></main>; }
