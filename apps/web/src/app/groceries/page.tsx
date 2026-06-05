import type { Metadata } from "next";

import { fetchGroceriesData } from "../../features/groceries/groceries-data";
import { GroceriesPage } from "../../features/groceries/groceries-page";

export const metadata: Metadata = {
  title: "Groceries",
  description: "Review saved recipe ingredients and profile pantry items.",
};

export default async function GroceriesRoute() {
  const groceries = await fetchGroceriesData();

  return <GroceriesPage groceries={groceries} />;
}
