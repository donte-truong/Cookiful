import type { Metadata } from "next";

import { SignupPage } from "../../features/auth/signup";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Cookiful profile and begin building your kitchen."
};

export default function SignupRoute() {
  return <SignupPage />;
}
