import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ChevronLeft, ChevronRight, Bus } from "lucide-react";

interface Booking {
  id: string;
  booking_id: string;
  amount: number;
  status: string;
  created_at: string;
  bus: {
    name: string;
    from_city: string;
    to_city: string;
  };
}

const ITEMS_PER_PAGE = 10;

const BookingHistory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
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
        loadBookings(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadBookings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          bus:buses(name, from_city, to_city)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter));
    }
    setCurrentPage(1);
  }, [statusFilter, bookings]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Booking History</h1>
                <p className="text-sm text-muted-foreground">View all your bookings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>Total {filteredBookings.length} booking(s)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter by:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Success">Success</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedBookings.length === 0 ? (
              <div className="text-center py-12">
                <Bus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No bookings found</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Bus Name</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.booking_id}</TableCell>
                          <TableCell>{booking.bus?.name}</TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {booking.bus?.from_city} → {booking.bus?.to_city}
                            </span>
                          </TableCell>
                          <TableCell>₹{booking.amount}</TableCell>
                          <TableCell>
                            <Badge variant={booking.status === "Success" ? "default" : "destructive"}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(booking.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingHistory;
