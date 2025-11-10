import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bus, ArrowRight, Wallet, TicketCheck, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          {/* Logo */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl">
            <Bus className="w-12 h-12 text-primary-foreground" />
          </div>
          
          {/* Heading */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bus Booking Made Simple
            </h1>
            <p className="text-xl text-muted-foreground">
              Book your journey with ease. Fast, secure, and convenient bus booking platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 shadow-lg"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl">
            <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Digital Wallet</h3>
              <p className="text-muted-foreground">
                Manage your balance and make instant payments with our secure digital wallet.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 border border-border/50">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <TicketCheck className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">
                Browse available buses and book your tickets in just a few clicks.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 border border-border/50">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Safe</h3>
              <p className="text-muted-foreground">
                Your data and transactions are protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
