"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  label: string;
  pending?: boolean;
  pendingLabel: string;
};

export function AuthSubmitButton({
  label,
  pending,
  pendingLabel,
}: AuthSubmitButtonProps) {
  const formStatus = useFormStatus();
  const isPending = pending ?? formStatus.pending;

  return (
    <button
      className="mt-2 rounded-[1.7rem] bg-copper-gradient px-8 py-4 text-lg font-semibold text-white shadow-hearth transition duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-75"
      disabled={isPending}
      type="submit"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}
