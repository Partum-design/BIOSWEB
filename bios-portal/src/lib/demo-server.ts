import { cookies } from "next/headers";
import {
  DEMO_SESSION_COOKIE,
  getDemoProfile,
  getDemoRoleFromCookie,
  isDemoMode,
} from "@/lib/demo";

export function getDemoSession() {
  if (!isDemoMode) return null;

  const role = getDemoRoleFromCookie(cookies().get(DEMO_SESSION_COOKIE)?.value);
  if (!role) return null;

  return {
    role,
    profile: getDemoProfile(role),
  };
}
