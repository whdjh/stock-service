import Link from "next/link";
import { Sector } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface SectorCardProps {
  sector: Sector;
}

export default function SectorCard({ sector }: SectorCardProps) {
  return (
    <Card>
      <Card.Header>
        <h3 className="text-base font-semibold text-foreground">{sector.name}</h3>
      </Card.Header>
      <Card.Body>
        <div className="space-y-2">
          {sector.stocks.slice(0, 5).map((stock) => (
            <Link
              key={stock.symbol}
              href={`/stock/${stock.symbol}`}
              className="flex items-center justify-between py-1 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <span className="text-sm text-foreground">{stock.name}</span>
              <Badge value={stock.changesPercentage} />
            </Link>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
