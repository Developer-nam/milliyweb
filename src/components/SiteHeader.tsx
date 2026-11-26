import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ShoppingCart, User as UserIcon, Shield, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";
import { useState } from "react";

export function SiteHeader() {
  const { user, isAdmin, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const goHash = (hash: string) => {
    setOpen(false);
    if (router.state.location.pathname !== "/") {
      navigate({ to: "/" });
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 250);
    } else {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const navLinks = (
    <>
      <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
        Bosh sahifa
      </Link>
      <button onClick={() => goHash("about")} className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Biz haqimizda
      </button>
      <button onClick={() => goHash("sites")} className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Bizning Saytlar
      </button>
      {isAdmin && (
        <Link
          to="/admin"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
          onClick={() => setOpen(false)}
        >
          <Shield className="h-4 w-4" /> Admin Panel
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Milliy Web logo" width={36} height={36} className="h-9 w-9" />
          <span className="text-lg font-bold text-gradient">Milliy Web</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">{navLinks}</nav>

        <div className="flex items-center gap-1">
          <Link to="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{profile?.full_name || "Admin"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <Shield className="mr-2 h-4 w-4" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="flex w-52 flex-col gap-2 p-3">
              {navLinks}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}