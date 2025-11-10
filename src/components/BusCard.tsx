import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, IndianRupee, Users } from "lucide-react";

interface BusCardProps {
  bus: {
    id: string;
    bus_id: string;
    name: string;
    from_city: string;
    to_city: string;
    fare: number;
    seats_available: number;
  };
  onBookNow: () => void;
}

const BusCard = ({ bus, onBookNow }: BusCardProps) => {
  return (
    <Card className="hover:shadow-[var(--shadow-hover)] transition-all duration-300 border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Bus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{bus.name}</h3>
              <p className="text-sm text-muted-foreground">{bus.bus_id}</p>
            </div>
          </div>
          <Badge variant={bus.seats_available > 10 ? "default" : "secondary"}>
            <Users className="w-3 h-3 mr-1" />
            {bus.seats_available} seats
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">{bus.from_city}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{bus.to_city}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-success" />
            <span className="text-2xl font-bold">₹{bus.fare}</span>
            <span className="text-sm text-muted-foreground">per seat</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onBookNow}
          className="w-full"
          size="lg"
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BusCard;
