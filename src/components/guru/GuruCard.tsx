"use client";

import { useRouter } from "next/navigation";
import { Guru } from "@/types";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { User, Landmark, Building2 } from "lucide-react";

const guruIcons = {
  institutional: Building2,
  congress: Landmark,
  pension: Building2,
};

interface GuruCardProps {
  guru: Guru;
}

export default function GuruCard({ guru }: GuruCardProps) {
  const router = useRouter();
  const Icon = guruIcons[guru.type] ?? User;

  return (
    <Card
      className="min-w-[160px]"
      onClick={() => router.push(`/guru/${guru.id}`)}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon size={24} className="text-muted" />
        </div>
        <p className="text-sm font-semibold text-foreground">{guru.name}</p>
        <Badge value={guru.returnRate} suffix="% /yr" />
      </div>
    </Card>
  );
}
