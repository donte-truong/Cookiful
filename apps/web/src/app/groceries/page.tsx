import type { Metadata } from "next";

import { EMPTY_GROCERIES_DATA } from "../../features/groceries/groceries-data";
import { GroceriesPage } from "../../features/groceries/groceries-page";

export const metadata: Metadata = {
  title: "Groceries",
  description: "Review saved recipe ingredients and profile pantry items.",
};

export default function GroceriesRoute() {
  return <GroceriesPage groceries={EMPTY_GROCERIES_DATA} />;
}
