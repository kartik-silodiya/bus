import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bus, MapPin, IndianRupee, Wallet } from "lucide-react";

interface BookingModalProps {
  bus: {
    id: string;
    bus_id: string;
    name: string;
    from_city: string;
    to_city: string;
    fare: number;
  };
  userId: string;
  walletBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal = ({ bus, userId, walletBalance, onClose, onSuccess }: BookingModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (walletBalance < bus.fare) {
      toast.error("Insufficient Balance", {
        description: `You need ₹${bus.fare - walletBalance} more to book this bus.`
      });
      return;
    }

    setLoading(true);
    try {
      // Generate booking ID
      const bookingId = `BK${Date.now()}`;

      // Create booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          booking_id: bookingId,
          user_id: userId,
          bus_id: bus.id,
          amount: bus.fare,
          status: "Success"
        });

      if (bookingError) throw bookingError;

      // Update wallet balance
      const newBalance = walletBalance - bus.fare;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Booking Successful!", {
        description: `Your booking ID is ${bookingId}. ₹${bus.fare} has been deducted from your wallet.`
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Booking Failed", {
        description: error.message || "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
          <DialogDescription>Review your booking details before confirming</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold">{bus.name}</p>
                <p className="text-sm text-muted-foreground">{bus.bus_id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">{bus.from_city}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">{bus.to_city}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Bus Fare</Label>
              <div className="flex items-center gap-1 text-lg font-bold">
                <IndianRupee className="w-4 h-4" />
                {bus.fare}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Label>Current Wallet Balance</Label>
              <div className="flex items-center gap-1 text-lg font-bold text-primary">
                <Wallet className="w-4 h-4" />
                {walletBalance}
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <Label>Balance After Booking</Label>
              <div className={`flex items-center gap-1 text-lg font-bold ${
                walletBalance - bus.fare < 0 ? 'text-destructive' : 'text-success'
              }`}>
                <IndianRupee className="w-4 h-4" />
                {walletBalance - bus.fare}
              </div>
            </div>
          </div>

          {walletBalance < bus.fare && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">
                Insufficient balance! You need ₹{bus.fare - walletBalance} more.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleBooking} 
            disabled={loading || walletBalance < bus.fare}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
