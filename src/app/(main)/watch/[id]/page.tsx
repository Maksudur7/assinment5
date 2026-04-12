import { WatchPage } from "@/src/pages/WatchPage";

type WatchRoutePageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: WatchRoutePageProps) {
  const { id } = await params;

  return <WatchPage id={id} />;
}
