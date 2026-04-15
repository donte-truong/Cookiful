import { redirect } from "next/navigation";

export async function continueToHome() {
  "use server";

  redirect("/home");
}
