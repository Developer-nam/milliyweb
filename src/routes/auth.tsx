import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { PhoneInput } from "@/components/PhoneInput";
import { isCompleteUzPhone } from "@/lib/phone";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : "/" }),
  head: () => ({ meta: [{ title: "Kirish / Ro'yxatdan o'tish — Milliy Web" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  // login
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  // register
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: redirect as "/" });
  }, [user, redirect, navigate]);

  const doGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google orqali kirish amalga oshmadi");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      toast.success("Xush kelibsiz!");
      navigate({ to: redirect as "/" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const doLogin = async () => {
    const identifier = loginMethod === "email" ? loginEmail.trim() : loginPhone;
    if (!identifier || !loginPass) return toast.error("Login va parolni kiriting");
    if (loginMethod === "email" && !identifier.includes("@")) return toast.error("To'g'ri email kiriting");
    setLoading(true);
    try {
      await signIn(identifier, loginPass);
      toast.success("Xush kelibsiz!");
      navigate({ to: redirect as "/" });
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg);
      if (msg.includes("mavjud emas")) setTab("register");
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async () => {
    if (!name || !phone || !pass) return toast.error("Barcha maydonlarni to'ldiring");
    if (!isCompleteUzPhone(phone)) return toast.error("Telefon raqamni to'liq kiriting");
    if (email.trim() && !email.includes("@")) return toast.error("To'g'ri email kiriting");
    if (pass !== pass2) return toast.error("Parollar mos kelmadi");
    if (pass.length < 6) return toast.error("Parol kamida 6 ta belgi bo'lsin");
    setLoading(true);
    try {
      await signUp(name, phone, pass, email.trim() || undefined);
      toast.success("Akkaunt yaratildi!");
      navigate({ to: redirect as "/" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="mb-6 text-center text-3xl font-bold text-gradient">Milliy Web</h1>
      <Tabs value={tab} onValueChange={setTab} className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Kirish</TabsTrigger>
          <TabsTrigger value="register">Ro'yxatdan o'tish</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={doGoogle}
            disabled={googleLoading}
            className="w-full gap-2"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.53 1 10.22 1 12s.43 3.47 1.18 4.96l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
            )}
            Google bilan davom ettirish
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            yoki
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        <TabsContent value="login" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`rounded-md py-1.5 text-sm font-medium transition-colors ${loginMethod === "phone" ? "bg-background shadow" : "text-muted-foreground"}`}
            >
              Telefon
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`rounded-md py-1.5 text-sm font-medium transition-colors ${loginMethod === "email" ? "bg-background shadow" : "text-muted-foreground"}`}
            >
              Email
            </button>
          </div>
          {loginMethod === "phone" ? (
            <div className="space-y-1.5">
              <Label>Telefon raqam</Label>
              <PhoneInput value={loginPhone} onValueChange={setLoginPhone} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Email manzil</Label>
              <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="example@gmail.com" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Parol</Label>
            <Input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doLogin()} />
          </div>
          <Button onClick={doLogin} disabled={loading} className="w-full bg-gradient-primary text-primary-foreground">
            {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Kirish
          </Button>
        </TabsContent>

        <TabsContent value="register" className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Ism</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Telefon raqam</Label>
            <PhoneInput value={phone} onValueChange={setPhone} />
          </div>
          <div className="space-y-1.5">
            <Label>Email manzil (ixtiyoriy)</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Parol</Label>
            <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Parolni takrorlang</Label>
            <Input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doRegister()} />
          </div>
          <Button onClick={doRegister} disabled={loading} className="w-full bg-gradient-primary text-primary-foreground">
            {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Ro'yxatdan o'tish
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}