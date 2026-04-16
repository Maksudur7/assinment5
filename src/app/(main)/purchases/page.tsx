"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { portalService } from "@/src/lib/portal";
import type { MediaItem, PurchaseRecord } from "@/src/lib/portal/types";

export default function PurchasesPage() {
  const [items, setItems] = useState<PurchaseRecord[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, MediaItem>>({});

  useEffect(() => {
    async function fetchData() {
      const [history, media] = await Promise.all([
        portalService.getPurchaseHistory(),
        portalService.getMedia({ page: 1, pageSize: 200 }),
      ]);
      setItems(history);
      const map: Record<string, MediaItem> = {};
      media.items.forEach((item) => {
        map[item.id] = item;
      });
      setMediaMap(map);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-3xl">Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-white/60">No purchase records yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white">Order</TableHead>
                    <TableHead className="text-white">Title</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Amount</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white">{item.id}</TableCell>
                      <TableCell className="text-white">{item.mediaId ? (mediaMap[item.mediaId]?.title ?? "Unknown title") : "Subscription Plan"}</TableCell>
                      <TableCell className="text-white capitalize">{item.type}</TableCell>
                      <TableCell className="text-white">${item.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-white">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={item.status === "active" ? "bg-green-600" : "bg-zinc-700"}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.mediaId && item.status === "active" ? (
                          <Link href={`/watch/${item.mediaId}`} className="text-[#E50914] hover:underline">
                            Open Stream
                          </Link>
                        ) : (
                          <span className="text-white/50">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
