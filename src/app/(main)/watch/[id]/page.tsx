import { WatchClient } from "./WatchClient";

type WatchRoutePageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: WatchRoutePageProps) {
  const { id } = await params;

  return <WatchClient id={id} />;
}
