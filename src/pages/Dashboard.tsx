import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogOut, Wallet, Bus, TicketCheck, Search } from "lucide-react";
import BusCard from "@/components/BusCard";
import BookingModal from "@/components/BookingModal";
import StatsCards from "@/components/StatsCards";

interface Profile {
  id: string;
  name: string;
  email: string;
  wallet_balance: number;
}

interface Bus {
  id: string;
  bus_id: string;
  name: string;
  from_city: string;
  to_city: string;
  fare: number;
  seats_available: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        loadDashboardData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDashboardData = async (userId: string) => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load buses
      const { data: busesData, error: busesError } = await supabase
        .from("buses")
        .select("*")
        .order("name");

      if (busesError) throw busesError;
      setBuses(busesData || []);
      setFilteredBuses(busesData || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = buses;
    
    if (searchFrom) {
      filtered = filtered.filter(bus => 
        bus.from_city.toLowerCase().includes(searchFrom.toLowerCase())
      );
    }
    
    if (searchTo) {
      filtered = filtered.filter(bus => 
        bus.to_city.toLowerCase().includes(searchTo.toLowerCase())
      );
    }
    
    setFilteredBuses(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleBookingSuccess = () => {
    if (user?.id) {
      loadDashboardData(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Bus Booking</h1>
                <p className="text-sm text-muted-foreground">Welcome, {profile?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/bookings")}>
                <TicketCheck className="w-4 h-4 mr-2" />
                My Bookings
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Wallet and Stats */}
        <div className="mb-8">
          <StatsCards 
            walletBalance={profile?.wallet_balance || 0} 
            userId={user?.id || ""} 
          />
        </div>

        {/* Search Section */}
        <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] mb-8">
          <h2 className="text-2xl font-bold mb-4">Search Buses</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="From City"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="To City"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchFrom("");
                setSearchTo("");
                setFilteredBuses(buses);
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Available Buses */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Buses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                onBookNow={() => setSelectedBus(bus)}
              />
            ))}
          </div>
          {filteredBuses.length === 0 && (
            <div className="text-center py-12">
              <Bus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No buses found</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedBus && (
        <BookingModal
          bus={selectedBus}
          userId={user?.id || ""}
          walletBalance={profile?.wallet_balance || 0}
          onClose={() => setSelectedBus(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
