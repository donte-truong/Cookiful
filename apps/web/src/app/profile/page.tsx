import type { Metadata } from "next";

import { EMPTY_PROFILE_DATA } from "../../features/profile/profile-data";
import { ProfilePage } from "../../features/profile/profile-page";

export const metadata: Metadata = {
  title: "Profile",
  description: "Review your liked, saved, and reposted Cookiful recipes."
};

export default function ProfileRoute() {
  return <ProfilePage profile={EMPTY_PROFILE_DATA} />;
}
