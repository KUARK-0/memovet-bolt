import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const { signUp, signIn, loading: authLoading, error: authError } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error("Şifreler eşleşmiyor");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error("Şifre en az 6 karakter olmalıdır");
          setLoading(false);
          return;
        }
        await signUp(email, password);
        toast.success(
          "Kayıt başarılı! Lütfen email onayınızı yapın."
        );
      } else {
        await signIn(email, password);
        toast.success("Oturum açıldı!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "İşlem başarısız";
      if (message.includes("User already registered")) {
        toast.error("Bu email zaten kayıtlı. Lütfen oturum açın.");
      } else if (message.includes("Invalid login credentials")) {
        toast.error("Email veya şifre yanlış");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-2">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Büyükbaş Veteriner
            </h1>
            <p className="text-sm text-muted-foreground">
              Yönetim Sistemi
            </p>
          </div>
          <CardTitle className="text-xl">
            {isSignUp ? "Hesap Oluştur" : "Oturum Aç"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Yeni bir hesap oluşturun"
              : "Mevcut hesabınızla oturum açın"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {(authError || authLoading) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {authError ||
                  "Bağlantı kuruluyor..."}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="ornek@veteriner.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || authLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre</label>
              <Input
                type="password"
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || authLoading}
                minLength={6}
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Şifre Tekrar
                </label>
                <Input
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                  disabled={loading || authLoading}
                  minLength={6}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || authLoading}
            >
              {(loading || authLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSignUp ? "Hesap Oluştur" : "Oturum Aç"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                veya
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            disabled={loading || authLoading}
          >
            {isSignUp
              ? "Zaten hesabınız var mı? Oturum Açın"
              : "Hesabınız yok mu? Kaydolun"}
          </Button>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              Demo kullanmak için:
            </p>
            <p>Email: demo@example.com</p>
            <p>Şifre: demo123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
