import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCriancas, getCriancaAtivaId, setCriancaAtivaId, type Crianca } from "@/hooks/useCriancas";
import { ArrowLeft, Plus, Trash2, Check, Loader2 } from "lucide-react";

const INTERESSES = [
  "Animais", "Espaço", "Natureza", "Dinossauros", "Música",
  "Esportes", "Desenhar", "Cozinhar", "Robôs", "Histórias",
];

const emptyForm = { nome: "", idade: "", interesses: [] as string[] };

const MinhasCriancas = () => {
  const navigate = useNavigate();
  const { criancas, loading, addCrianca, updateCrianca, removeCrianca } = useCriancas();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ativa, setAtiva] = useState<string | null>(getCriancaAtivaId());

  const startEdit = (c: Crianca) => {
    setEditing(c.id);
    setForm({ nome: c.nome, idade: c.idade != null ? String(c.idade) : "", interesses: c.interesses ?? [] });
  };

  const toggleInteresse = (i: string) =>
    setForm((f) => ({
      ...f,
      interesses: f.interesses.includes(i)
        ? f.interesses.filter((x) => x !== i)
        : [...f.interesses, i],
    }));

  const save = async () => {
    setErr(null);
    const nome = form.nome.trim();
    if (nome.length < 2) return setErr("Escreva o nome da criança.");
    const idadeNum = form.idade === "" ? null : Number(form.idade);
    if (idadeNum !== null && (!Number.isInteger(idadeNum) || idadeNum < 0 || idadeNum > 17)) {
      return setErr("A idade precisa ser um número entre 0 e 17.");
    }
    setBusy(true);
    try {
      if (editing) {
        await updateCrianca(editing, { nome, idade: idadeNum, interesses: form.interesses });
      } else {
        const nova = await addCrianca({ nome, idade: idadeNum, interesses: form.interesses });
        if (!ativa) {
          setCriancaAtivaId(nova.id);
          setAtiva(nova.id);
        }
      }
      setForm(emptyForm);
      setEditing(null);
    } catch {
      setErr("Não deu para salvar agora. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const escolher = (id: string) => {
    setCriancaAtivaId(id);
    setAtiva(id);
  };

  return (
    <main className="min-h-screen px-4 pb-20" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
      <button
        onClick={() => navigate(-1)}
        className="min-h-[44px] min-w-[44px] flex items-center gap-2 text-[16px] font-semibold text-gray-800"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden /> Voltar
      </button>

      <h1 className="mt-3 text-[24px] font-extrabold text-gray-900">Minhas crianças</h1>
      <p className="mt-1 text-[16px] text-gray-700">
        Escolha quem vai brincar agora. Cada criança tem seus próprios gostos e memórias.
      </p>

      <section className="mt-5 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-700 text-[16px]">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Carregando…
          </div>
        ) : criancas.length === 0 ? (
          <p className="text-[16px] text-gray-700">Nenhuma criança cadastrada ainda.</p>
        ) : (
          criancas.map((c) => (
            <article
              key={c.id}
              className={`rounded-3xl border p-4 bg-white/70 backdrop-blur-xl shadow ${
                ativa === c.id ? "border-emerald-500" : "border-white/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-[18px] font-bold text-gray-900 break-words">{c.nome}</h2>
                  <p className="text-[15px] text-gray-700">
                    {c.idade != null ? `${c.idade} anos` : "Idade não informada"}
                    {c.interesses?.length ? ` · ${c.interesses.join(", ")}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => escolher(c.id)}
                  aria-label={`Escolher ${c.nome}`}
                  className={`min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center ${
                    ativa === c.id ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Check className="w-5 h-5" aria-hidden />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startEdit(c)}
                  className="min-h-[44px] px-4 rounded-2xl bg-gray-900 text-white text-[15px] font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => removeCrianca(c.id)}
                  aria-label={`Remover ${c.nome}`}
                  className="min-h-[44px] min-w-[44px] rounded-2xl bg-red-50 text-red-700 flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5" aria-hidden />
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="mt-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow p-4">
        <h2 className="text-[18px] font-bold text-gray-900">
          {editing ? "Editar criança" : "Adicionar criança"}
        </h2>

        <label className="block mt-3 text-[15px] font-semibold text-gray-800" htmlFor="nome">
          Nome
        </label>
        <input
          id="nome"
          value={form.nome}
          onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          className="mt-1 w-full min-h-[48px] rounded-2xl border border-gray-300 px-4 text-[16px] bg-white"
          placeholder="Como chamamos a criança?"
        />

        <label className="block mt-3 text-[15px] font-semibold text-gray-800" htmlFor="idade">
          Idade (em anos)
        </label>
        <input
          id="idade"
          inputMode="numeric"
          value={form.idade}
          onChange={(e) => setForm((f) => ({ ...f, idade: e.target.value.replace(/\D/g, "").slice(0, 2) }))}
          className="mt-1 w-full min-h-[48px] rounded-2xl border border-gray-300 px-4 text-[16px] bg-white"
          placeholder="Ex.: 6"
        />

        <p className="mt-3 text-[15px] font-semibold text-gray-800">Do que ela gosta</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESSES.map((i) => {
            const on = form.interesses.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleInteresse(i)}
                aria-pressed={on}
                className={`min-h-[44px] px-4 rounded-2xl text-[15px] font-semibold ${
                  on ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {i}
              </button>
            );
          })}
        </div>

        {err && <p className="mt-3 text-[15px] text-red-700">{err}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={save}
            disabled={busy}
            className="flex-1 min-h-[48px] rounded-2xl bg-gray-900 text-white font-bold text-[16px] flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : <Plus className="w-5 h-5" aria-hidden />}
            {editing ? "Salvar alterações" : "Adicionar"}
          </button>
          {editing && (
            <button
              onClick={() => { setEditing(null); setForm(emptyForm); }}
              className="min-h-[48px] px-4 rounded-2xl bg-gray-100 text-gray-800 font-semibold text-[16px]"
            >
              Cancelar
            </button>
          )}
        </div>
      </section>
    </main>
  );
};

export default MinhasCriancas;
