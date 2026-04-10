import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, Shield, Crown, X, CalendarPlus, Users, MessageCircle, BookOpen, Activity } from "lucide-react";

interface UserProfile {
  id: string;
  child_name: string;
  is_premium: boolean;
  premium_source: string | null;
  plan_end_date: string | null;
  created_at: string;
  points?: number;
  streak_days?: number;
  level?: string;
  questions_used?: number;
}

interface Metrics {
  totalUsers: number;
  premiumUsers: number;
  totalQuestions: number;
  totalStories: number;
  activeToday: number;
  recentSignups: number;
}

const Admin = () => {
  const { profile, isReady } = useAuth();
  const navigate = useNavigate();
  const [searchEmail, setSearchEmail] = useState("");
  const [results, setResults] = useState<(UserProfile & { email?: string })[]>([]);
  const [searching, setSearching] = useState(false);
  const [endDateInput, setEndDateInput] = useState<Record<string, string>>({});
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (isReady && !profile?.is_admin) {
      navigate("/");
    }
  }, [isReady, profile, navigate]);

  useEffect(() => {
    if (isReady && profile?.is_admin) {
      loadMetrics();
    }
  }, [isReady, profile]);

  if (!isReady || !profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-5xl animate-bounce">🔒</div>
      </div>
    );
  }

  const loadMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "metrics" },
      });
      if (error) throw error;
      setMetrics(data);
    } catch (err: any) {
      console.error("Metrics error:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "search", email: searchEmail.trim() },
      });
      if (error) throw error;
      setResults(data?.users || []);
      if (!data?.users?.length) toast.info("Nenhum usuário encontrado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao buscar");
    } finally {
      setSearching(false);
    }
  };

  const handleTogglePremium = async (userId: string, activate: boolean) => {
    try {
      const body: any = { action: activate ? "activate" : "deactivate", userId };
      if (activate && endDateInput[userId]) {
        body.planEndDate = new Date(endDateInput[userId]).toISOString();
      }
      const { error } = await supabase.functions.invoke("admin-users", { body });
      if (error) throw error;
      toast.success(activate ? "Premium ativado!" : "Premium removido!");
      handleSearch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    }
  };

  const handleExtend = async (userId: string) => {
    const newDate = endDateInput[userId];
    if (!newDate) {
      toast.error("Selecione uma data");
      return;
    }
    try {
      const { error } = await supabase.functions.invoke("admin-users", {
        body: { action: "extend", userId, planEndDate: new Date(newDate).toISOString() },
      });
      if (error) throw error;
      toast.success("Plano estendido!");
      handleSearch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao estender");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Painel Admin</h1>
      </div>

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-kid-blue" />
            <p className="text-2xl font-black text-foreground">{metrics.totalUsers}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Usuários</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Crown className="w-5 h-5 mx-auto mb-1 text-kid-purple" />
            <p className="text-2xl font-black text-foreground">{metrics.premiumUsers}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Premium</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <MessageCircle className="w-5 h-5 mx-auto mb-1 text-kid-pink" />
            <p className="text-2xl font-black text-foreground">{metrics.totalQuestions}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Perguntas</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Activity className="w-5 h-5 mx-auto mb-1 text-kid-green" />
            <p className="text-2xl font-black text-foreground">{metrics.activeToday}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Ativos Hoje</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <BookOpen className="w-5 h-5 mx-auto mb-1 text-kid-orange" />
            <p className="text-2xl font-black text-foreground">{metrics.totalStories}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Histórias</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-kid-yellow" />
            <p className="text-2xl font-black text-foreground">{metrics.recentSignups}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Novos (7d)</p>
          </div>
        </div>
      )}
      {loadingMetrics && !metrics && (
        <div className="text-center text-muted-foreground text-sm mb-6">Carregando métricas...</div>
      )}

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Buscar por email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={searching}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((user) => (
          <div key={user.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{user.email || "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {user.child_name || "Sem nome"} · Desde {new Date(user.created_at).toLocaleDateString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.questions_used ?? 0} perguntas · {user.points ?? 0} pts · 🔥 {user.streak_days ?? 0} · Nível: {user.level ?? "iniciante"}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_premium ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {user.is_premium ? `Premium (${user.premium_source || "?"})` : "Gratuito"}
              </div>
            </div>

            {user.plan_end_date && (
              <p className="text-xs text-muted-foreground">
                Expira: {new Date(user.plan_end_date).toLocaleDateString("pt-BR")}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={endDateInput[user.id] || ""}
                  onChange={(e) => setEndDateInput(prev => ({ ...prev, [user.id]: e.target.value }))}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {!user.is_premium ? (
                  <Button size="sm" onClick={() => handleTogglePremium(user.id, true)} className="gap-1">
                    <Crown className="w-3 h-3" /> Ativar Premium
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="destructive" onClick={() => handleTogglePremium(user.id, false)} className="gap-1">
                      <X className="w-3 h-3" /> Remover Premium
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExtend(user.id)} className="gap-1">
                      <CalendarPlus className="w-3 h-3" /> Estender
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" className="mt-6" onClick={() => navigate("/")}>
        ← Voltar
      </Button>
    </div>
  );
};

export default Admin;
