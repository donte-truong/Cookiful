import Link from "next/link";

import { continueToHome } from "../actions";
import { AppleIcon, GoogleIcon } from "./login-icons";

export function LoginForm() {
  return (
    <div className="glass-panel hearth-shadow rounded-[2rem] p-7 sm:p-10">
      <form action={continueToHome} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label
            className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-hearth-text"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            className="rounded-t-[1rem] border-0 border-b-2 border-hearth-outline/30 bg-hearth-container/70 px-4 py-4 text-lg text-hearth-text placeholder:text-hearth-outline focus:border-hearth-copper focus:ring-0"
            id="email"
            name="email"
            placeholder="chef@culinary.com"
            type="email"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-4">
            <label
              className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-hearth-text"
              htmlFor="password"
            >
              Password
            </label>
            <Link
              className="text-sm font-medium text-hearth-accent transition hover:text-hearth-copper hover:underline"
              href="/login"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            className="rounded-t-[1rem] border-0 border-b-2 border-hearth-outline/30 bg-hearth-container/70 px-4 py-4 text-lg text-hearth-text placeholder:text-hearth-outline focus:border-hearth-copper focus:ring-0"
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
          />
        </div>

        <button
          className="mt-2 rounded-[1.7rem] bg-copper-gradient px-8 py-4 text-lg font-semibold text-white shadow-hearth transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
          type="submit"
        >
          Sign In
        </button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-hearth-ghost/70" />
        <span className="text-xs uppercase tracking-[0.28em] text-hearth-outline">
          Or Continue With
        </span>
        <div className="h-px flex-1 bg-hearth-ghost/70" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          className="flex items-center justify-center gap-3 rounded-[1.6rem] bg-hearth-high/85 px-5 py-4 text-hearth-text transition duration-300 hover:bg-hearth-high"
          type="button"
        >
          <GoogleIcon className="h-5 w-5" />
          <span className="text-lg font-medium">Google</span>
        </button>

        <button
          className="flex items-center justify-center gap-3 rounded-[1.6rem] bg-hearth-high/85 px-5 py-4 text-hearth-text transition duration-300 hover:bg-hearth-high"
          type="button"
        >
          <AppleIcon className="h-5 w-5" />
          <span className="text-lg font-medium">Apple</span>
        </button>
      </div>
    </div>
  );
}
