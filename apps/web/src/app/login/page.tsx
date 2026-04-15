import type { Metadata } from "next";

import { LoginPage } from "../../features/auth/login";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Return to your plans, pantry, and editorial kitchen tools."
};

export default function LoginRoute() {
  return <LoginPage />;
}
