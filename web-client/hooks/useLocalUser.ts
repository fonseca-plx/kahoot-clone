import { useLocalUserStore } from "@/store";

export function useLocalUser() {
  const { user, setDisplayName, setUserId, ensureDisplayName } = useLocalUserStore();

  return {
    displayName: user?.displayName || ensureDisplayName(),
    userId: user?.userId,
    email: user?.email,
    setDisplayName,
    setUserId
  };
}