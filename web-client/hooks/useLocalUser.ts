import { useLocalUserStore } from "@/store";
import { generateRandomName } from "@/lib/utils";

export function useLocalUser() {
  const { displayName, setDisplayName } = useLocalUserStore();

  const ensureDisplayName = () => {
    if (displayName) return displayName;
    const randomName = generateRandomName();
    setDisplayName(randomName);
    return randomName;
  };

  return {
    displayName: displayName || "",
    hasDisplayName: !!displayName,
    setDisplayName,
    ensureDisplayName
  };
}