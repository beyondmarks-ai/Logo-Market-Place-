import { AccountNav } from "../../components/account-nav"; import { AuthForm } from "../../components/auth-form"; import { BackgroundAnimation } from "../../components/background-animation";
export default function SignupPage() { return <main className="account-shell"><BackgroundAnimation /><AccountNav /><AuthForm mode="signup" /></main>; }
