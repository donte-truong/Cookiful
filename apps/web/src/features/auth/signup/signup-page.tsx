import Link from "next/link";

import { BrandLogo } from "../../../components/brand/brand-logo";
import { LoginWave } from "../login/components/login-wave";
import { SignupForm } from "./components/signup-form";

export function SignupPage() {
  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-hearth-surface px-6 py-16 text-hearth-text sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,86,26,0.08),transparent_24%),radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.65),transparent_28%),linear-gradient(135deg,rgba(245,237,222,0.14),transparent_45%,rgba(239,231,217,0.18)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(120deg,transparent_0%,transparent_73%,rgba(224,192,178,0.12)_73.5%,transparent_74.2%,transparent_100%)] [background-size:320px_320px]" />
      <LoginWave />
      <LoginWave flip />

      <div className="relative z-10 mx-auto flex w-full max-w-[40rem] flex-col items-center justify-center">
        <Link
          aria-label="Home"
          className="mb-10 inline-flex flex-col items-center gap-4 text-center"
          href="/"
        >
          <BrandLogo className="h-16 w-auto sm:h-20" />
          <span className="font-display text-[1.9rem] italic tracking-[-0.03em] text-hearth-muted">
            Begin your table of favorites.
          </span>
        </Link>

        <div className="w-full max-w-[39rem]">
          <SignupForm />
        </div>

        <p className="mt-10 text-center text-lg text-hearth-muted">
          Already have an account?{" "}
          <Link
            className="font-semibold text-hearth-copper transition hover:text-hearth-copperSoft hover:underline"
            href="/login"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
