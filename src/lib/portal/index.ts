import { httpPortalService } from "./httpService";
import { mockPortalService } from "./mockService";

const useRemote = process.env.NEXT_PUBLIC_USE_REMOTE_API === "true";

export const portalService = useRemote ? httpPortalService : mockPortalService;
