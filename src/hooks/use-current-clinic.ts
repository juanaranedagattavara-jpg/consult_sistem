import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentClinic() {
  const user = useQuery(api.users.getCurrentUser);

  return {
    clinic: user?.clinic || null,
    isLoading: user === undefined,
    user: user || null,
  };
}
