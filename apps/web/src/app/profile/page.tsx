import type { Metadata } from "next";

import { fetchProfileData } from "../../features/profile/profile-data";
import { ProfilePage } from "../../features/profile/profile-page";

export const metadata: Metadata = {
  title: "Profile",
  description: "Review your liked, saved, and reposted Cookiful recipes."
};

export default async function ProfileRoute() {
  const profile = await fetchProfileData();

  return <ProfilePage profile={profile} />;
}
