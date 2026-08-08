import { WatchClient } from "./WatchClient";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";

type WatchRoutePageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: WatchRoutePageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <WatchClient id={id} />
    </ProtectedRoute>
  );
}

