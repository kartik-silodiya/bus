import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TicketCheck, IndianRupee } from "lucide-react";

interface StatsCardsProps {
  walletBalance: number;
  userId: string;
}

const StatsCards = ({ walletBalance, userId }: StatsCardsProps) => {
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("amount, status")
        .eq("user_id", userId)
        .eq("status", "Success");

      if (!error && data) {
        setTotalBookings(data.length);
        setTotalSpent(data.reduce((sum, booking) => sum + Number(booking.amount), 0));
      }
    };

    loadStats();
  }, [userId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
              <div className="flex items-center gap-1 mt-2">
                <IndianRupee className="w-6 h-6 text-primary" />
                <p className="text-3xl font-bold">{walletBalance}</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <Wallet className="w-7 h-7 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 border-l-4 border-l-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold mt-2">{totalBookings}</p>
            </div>
            <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center">
              <TicketCheck className="w-7 h-7 text-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 border-l-4 border-l-success">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <div className="flex items-center gap-1 mt-2">
                <IndianRupee className="w-6 h-6 text-success" />
                <p className="text-3xl font-bold">{totalSpent}</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center">
              <IndianRupee className="w-7 h-7 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
