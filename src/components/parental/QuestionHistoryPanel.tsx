import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Headphones,
  MessageSquare,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Play,
  Square,
  Calendar,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTTS } from "@/hooks/useTTS";
import { toast } from "sonner";

interface LogRow {
  id: string;
  question: string;
  answer: string;
  age_range: string | null;
  was_narrated: boolean;
  created_at: string;
}

type FilterMode = "all" | "narrated" | "not_narrated";
type DateRange = "all" | "today" | "7d" | "30d";
type AgeFilter = "all" | "0-3" | "3-7" | "7-10";

const PAGE_SIZE = 8;

const QuestionHistoryPanel = () => {
  const { user } = useAuth();
  const { speak, stop } = useTTS();

  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("kidzz_questions_log")
        .select("id, question, answer, age_range, was_narrated, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
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
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [filter, dateRange, ageFilter, search]);

  // Stop narration on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const dateThreshold = useMemo(() => {
    const now = Date.now();
    if (dateRange === "today") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    if (dateRange === "7d") return now - 7 * 24 * 60 * 60 * 1000;
    if (dateRange === "30d") return now - 30 * 24 * 60 * 60 * 1000;
    return 0;
  }, [dateRange]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "narrated" && !r.was_narrated) return false;
      if (filter === "not_narrated" && r.was_narrated) return false;
      if (ageFilter !== "all" && r.age_range !== ageFilter) return false;
      if (dateThreshold > 0 && new Date(r.created_at).getTime() < dateThreshold)
        return false;
      if (!q) return true;
      return (
        r.question.toLowerCase().includes(q) ||
        r.answer.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, ageFilter, dateThreshold, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  const activeFiltersCount =
    (filter !== "all" ? 1 : 0) +
    (dateRange !== "all" ? 1 : 0) +
    (ageFilter !== "all" ? 1 : 0);

  const handleDelete = async (id: string) => {
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    if (playingId === id) {
      stop();
      setPlayingId(null);
    }
    const { error } = await supabase
      .from("kidzz_questions_log")
      .delete()
      .eq("id", id);
    if (error) {
      setRows(prev);
      toast.error("Não foi possível apagar.");
    } else {
      toast.success("Pergunta apagada.");
    }
  };

  const handlePlay = async (row: LogRow) => {
    if (playingId === row.id) {
      stop();
      setPlayingId(null);
      return;
    }
    stop();
    setPlayingId(row.id);
    try {
      await speak(row.answer);
    } finally {
      setPlayingId((curr) => (curr === row.id ? null : curr));
    }
  };

  const clearFilters = () => {
    setFilter("all");
    setDateRange("all");
    setAgeFilter("all");
    setSearch("");
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary" />
          <p className="font-extrabold text-sm text-foreground">
            Últimas perguntas do Kidzz
          </p>
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`relative inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-colors ${
            showFilters || activeFiltersCount > 0
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground"
          }`}
        >
          <Filter size={10} />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[14px] h-[14px] px-1 rounded-full bg-background text-primary text-[9px]">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-1">
        Veja o que seu filho perguntou, ouça a resposta narrada e filtre por
        data ou faixa etária.
      </p>

      {/* Search */}
      <div className="relative">
        <Search
          size={12}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por palavra…"
          className="w-full pl-8 pr-8 py-2 rounded-xl bg-background border border-border text-foreground text-xs"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Quick narration filter (always visible) */}
      <div className="flex gap-1 bg-background rounded-full p-1">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all ${
            filter === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Todas ({rows.length})
        </button>
        <button
          onClick={() => setFilter("narrated")}
          className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
            filter === "narrated"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Headphones size={10} /> Narradas (
          {rows.filter((r) => r.was_narrated).length})
        </button>
        <button
          onClick={() => setFilter("not_narrated")}
          className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all ${
            filter === "not_narrated"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Sem áudio
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2 bg-background rounded-xl p-3 border border-border"
        >
          <div>
            <p className="text-[10px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar size={10} /> Período
            </p>
            <div className="grid grid-cols-4 gap-1">
              {(["all", "today", "7d", "30d"] as DateRange[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDateRange(d)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                    dateRange === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d === "all"
                    ? "Tudo"
                    : d === "today"
                    ? "Hoje"
                    : d === "7d"
                    ? "7 dias"
                    : "30 dias"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground mb-1">
              Faixa etária
            </p>
            <div className="grid grid-cols-4 gap-1">
              {(["all", "0-3", "3-7", "7-10"] as AgeFilter[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAgeFilter(a)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                    ageFilter === a
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {a === "all" ? "Todas" : `${a} anos`}
                </button>
              ))}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="w-full py-1.5 rounded-lg text-[10px] font-bold text-destructive hover:bg-destructive/10 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          {rows.length === 0
            ? "Ainda não há perguntas registradas. Quando seu filho perguntar algo no Kidzz, aparece aqui."
            : "Nenhuma pergunta com esses filtros."}
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {pageRows.map((row) => {
              const expanded = expandedId === row.id;
              const isPlaying = playingId === row.id;
              const date = new Date(row.created_at);
              const dateLabel = date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <motion.div
                  key={row.id}
                  layout
                  className="rounded-xl bg-background border border-border p-3"
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() =>
                        setExpandedId(expanded ? null : row.id)
                      }
                      className="flex-1 text-left min-w-0"
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
                    <button
                      onClick={() => handlePlay(row)}
                      aria-label={isPlaying ? "Parar narração" : "Tocar narração"}
                      className={`flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors ${
                        isPlaying
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      {isPlaying ? <Square size={12} /> : <Play size={12} />}
                    </button>
                  </div>

                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 pt-2 border-t border-border"
                    >
                      <p className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap">
                        {row.answer}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => handlePlay(row)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                        >
                          {isPlaying ? (
                            <>
                              <Square size={10} /> Parar
                            </>
                          ) : (
                            <>
                              <Play size={10} /> Ouvir resposta
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-destructive hover:underline"
                        >
                          <Trash2 size={10} /> Apagar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-foreground bg-background border border-border disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={12} /> Anterior
              </button>
              <p className="text-[10px] font-bold text-muted-foreground">
                Página {safePage + 1} de {pageCount} · {filtered.length}{" "}
                {filtered.length === 1 ? "item" : "itens"}
              </p>
              <button
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage >= pageCount - 1}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-foreground bg-background border border-border disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima <ChevronRight size={12} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionHistoryPanel;
