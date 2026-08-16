import type { Metadata } from "next";
import { ApiDocs } from "../../components/api-docs";
import { BackgroundAnimation } from "../../components/background-animation";

export const metadata: Metadata = {
  title: "API Documentation | Logo Market Place",
  description: "Integrate professional SVG brand search, variants, and customized logo downloads.",
};

export default function DevelopersPage() {
  return (
    <main className="developer-shell">
      <BackgroundAnimation />
      <ApiDocs />
    </main>
  );
}
