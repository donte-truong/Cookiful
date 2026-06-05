"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { registerWithPasswordClient } from "../../client-auth";
import { AuthSubmitButton } from "../../components/auth-submit-button";
import { initialAuthFormState } from "../../types";

export function SignupForm() {
  const router = useRouter();
  const [state, setState] = useState(initialAuthFormState);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      void registerWithPasswordClient(formData).then((result) => {
        setState(result);

        if (result.status === "success") {
          router.push("/home");
        }
      });
    });
  }

  return (
    <div className="glass-panel hearth-shadow rounded-[2rem] p-7 sm:p-10">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label
            className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-hearth-text"
            htmlFor="displayName"
          >
            Display Name
          </label>
          <input
            className="rounded-t-[1rem] border-0 border-b-2 border-hearth-outline/30 bg-hearth-container/70 px-4 py-4 text-lg text-hearth-text placeholder:text-hearth-outline focus:border-hearth-copper focus:ring-0"
            id="displayName"
            name="displayName"
            placeholder="Claire Saffron"
            type="text"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-hearth-text"
            htmlFor="username"
          >
            Username
          </label>
          <input
            autoComplete="username"
            className="rounded-t-[1rem] border-0 border-b-2 border-hearth-outline/30 bg-hearth-container/70 px-4 py-4 text-lg text-hearth-text placeholder:text-hearth-outline focus:border-hearth-copper focus:ring-0"
            id="username"
            name="username"
            placeholder="clairecooks"
            required
            type="text"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-hearth-text"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            autoComplete="email"
            className="rounded-t-[1rem] border-0 border-b-2 border-hearth-outline/30 bg-hearth-container/70 px-4 py-4 text-lg text-hearth-text placeholder:text-hearth-outline focus:border-hearth-copper focus:ring-0"
            id="email"
            name="email"
            placeholder="chef@culinary.com"
            required
            type="email"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-hearth-text"
              htmlFor="password"
            >
              Password
            </label>
            <input
              autoComplete="new-password"
              className="rounded-t-[1rem] border-0 border-b-2 border-hearth-outline/30 bg-hearth-container/70 px-4 py-4 text-lg text-hearth-text placeholder:text-hearth-outline focus:border-hearth-copper focus:ring-0"
              id="password"
              minLength={8}
              name="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-hearth-text"
              htmlFor="confirmPassword"
            >
              Confirm
            </label>
            <input
              autoComplete="new-password"
              className="rounded-t-[1rem] border-0 border-b-2 border-hearth-outline/30 bg-hearth-container/70 px-4 py-4 text-lg text-hearth-text placeholder:text-hearth-outline focus:border-hearth-copper focus:ring-0"
              id="confirmPassword"
              minLength={8}
              name="confirmPassword"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>
        </div>

        {state.status === "error" ? (
          <p
            className="rounded-[1.25rem] bg-hearth-blush/55 px-4 py-3 text-sm font-medium text-hearth-text"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <AuthSubmitButton
          label="Create Account"
          pending={isPending}
          pendingLabel="Creating Account"
        />
      </form>
    </div>
  );
}
