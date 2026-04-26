import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Headphones, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LogRow {
  id: string;
  question: string;
  answer: string;
  age_range: string | null;
  was_narrated: boolean;
  created_at: string;
}

type FilterMode = "all" | "narrated";

const QuestionHistoryPanel = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      const { data, error } = await supabase
        .from("kidzz_questions_log")
        .select("id, question, answer, age_range, was_narrated, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (error) {
        console.warn("[Kidzz] history load failed:", error.message);
        toast.error("Não foi possível carregar o histórico.");
      } else {
        setRows((data ?? []) as LogRow[]);
      }
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "narrated" && !r.was_narrated) return false;
      if (!q) return true;
      return (
        r.question.toLowerCase().includes(q) ||
        r.answer.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const handleDelete = async (id: string) => {
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    const { error } = await supabase.from("kidzz_questions_log").delete().eq("id", id);
    if (error) {
      setRows(prev);
      toast.error("Não foi possível apagar.");
    } else {
      toast.success("Pergunta apagada.");
    }
  };

  if (!user) {
    return (
      <div className="bg-muted/50 rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Faça login para ver o histórico de perguntas do seu filho.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 rounded-2xl p-4 space-y-3 border border-border">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} className="text-primary" />
        <p className="font-extrabold text-sm text-foreground">Últimas perguntas do Kidzz</p>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-1">
        Veja o que seu filho perguntou e quais respostas foram narradas em voz alta.
      </p>

      {/* Filters */}
      <div className="flex gap-1 bg-background rounded-full p-1">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all ${
            filter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Todas ({rows.length})
        </button>
        <button
          onClick={() => setFilter("narrated")}
          className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
            filter === "narrated" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          <Headphones size={10} /> Narradas ({rows.filter(r => r.was_narrated).length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por palavra…"
          className="w-full pl-8 pr-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          {rows.length === 0
            ? "Ainda não há perguntas registradas. Quando seu filho perguntar algo no Kidzz, aparece aqui."
            : "Nenhuma pergunta com esse filtro."}
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {filtered.map((row) => {
            const expanded = expandedId === row.id;
            const date = new Date(row.created_at);
            const dateLabel = date.toLocaleDateString("pt-BR", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
            });
            return (
              <motion.div
                key={row.id}
                layout
                className="rounded-xl bg-background border border-border p-3"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : row.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-foreground line-clamp-2 flex-1">
                      {row.question}
                    </p>
                    {row.was_narrated && (
                      <span className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        <Headphones size={9} /> Narrada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{dateLabel}</span>
                    {row.age_range && (
                      <>
                        <span>·</span>
                        <span>{row.age_range} anos</span>
                      </>
                    )}
                  </div>
                </button>

                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 pt-2 border-t border-border"
                  >
                    <p className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap">
                      {row.answer}
                    </p>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-destructive hover:underline"
                    >
                      <Trash2 size={10} /> Apagar
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestionHistoryPanel;
