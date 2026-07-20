/**
 * Validação — Aba MEMÓRIAS (premium v2)
 *
 *  1. Empty state acolhedor + CTAs (nunca tela em branco)
 *  2. Momentos = títulos reais das memories (consumo)
 *  3. Filtros por tipo
 *  4. Conquistas derivadas de counters reais (profile)
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { Memory } from "@/hooks/useMemories";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: {
      child_name: "Theo",
      is_premium: true,
      points: 320,
      questions_used: 2,
      stories_used: 1,
      streak_days: 3,
    },
    handleCheckout: vi.fn(),
  }),
}));

vi.mock("@/lib/storyProgress", () => ({
  getAllProgress: () => ({}),
}));

vi.mock("@/lib/weeklyActivities", () => ({
  getWeekKey: () => "2026-W29",
  loadCompletedSet: () => new Set<string>(),
  loadWeeklyCache: () => null,
  pickWeeklyFromPool: () => [],
}));

let mockState: {
  memories: Memory[];
  allMemories: Memory[];
  loading: boolean;
  filter: "all" | "question" | "story" | "mission" | "achievement";
  totalCount: number;
  lockedCount: number;
  isPremium: boolean;
};

const setFilterMock = vi.fn((f: any) => {
  mockState.filter = f;
  mockState.memories = mockState.allMemories.filter((m) => f === "all" || m.type === f);
});

vi.mock("@/hooks/useMemories", () => ({
  useMemories: () => ({
    ...mockState,
    setFilter: setFilterMock,
    toggleSpecial: vi.fn(),
    addMemory: vi.fn(),
    refetch: vi.fn(),
  }),
}));

vi.mock("@/components/flow/AchievementsScreen", () => ({
  default: () => <div data-testid="achievements-stub">Conquistas</div>,
}));

vi.mock("@/components/kidzz/KidzzChameleon", () => ({
  default: () => <div data-testid="kidzz-mascot" />,
}));

import MemoriesAlbum from "@/components/memories/MemoriesAlbum";

const makeMemory = (id: string, type: Memory["type"], title: string): Memory => ({
  id,
  user_id: "u1",
  type,
  title,
  content: `Conteúdo de ${title}`,
  is_special: false,
  image_url: null,
  metadata: {},
  created_at: new Date().toISOString(),
});

describe("Aba Memórias — empty state e exibição de conteúdo", () => {
  beforeEach(() => {
    setFilterMock.mockClear();
    mockState = {
      memories: [],
      allMemories: [],
      loading: false,
      filter: "all",
      totalCount: 0,
      lockedCount: 0,
      isPremium: true,
    };
  });

  afterEach(() => cleanup());

  it("EMPTY STATE: sem dados, mostra mensagem acolhedora + CTAs (não tela vazia)", () => {
    render(<MemoriesAlbum onBack={() => {}} />);

    expect(
      screen.getByText(/Aqui vão ficar as memórias mais preciosas de Theo/i)
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Fazer primeira pergunta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Criar primeira história/i })).toBeInTheDocument();
  });

  it("EMPTY STATE: CTAs disparam navegação para chat e histórias", () => {
    const onChat = vi.fn();
    const onStories = vi.fn();
    render(
      <MemoriesAlbum onBack={() => {}} onNavigateToChat={onChat} onNavigateToStories={onStories} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Fazer primeira pergunta/i }));
    expect(onChat).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Criar primeira história/i }));
    expect(onStories).toHaveBeenCalled();
  });

  it("LOADING: enquanto carrega, mostra placeholder (e nada de tela vazia)", () => {
    mockState.loading = true;
    render(<MemoriesAlbum onBack={() => {}} />);
    expect(screen.getByText(/Carregando memórias/i)).toBeInTheDocument();
  });

  it("CONTEÚDO: exibe títulos reais consumidos (perguntas, histórias, missões)", () => {
    const all: Memory[] = [
      makeMemory("1", "question", "Por que o céu é azul?"),
      makeMemory("2", "story", "A aventura de Theo na floresta"),
      makeMemory("3", "mission", "Caça às Emoções"),
      makeMemory("4", "achievement", "Primeira semana completa"),
    ];
    mockState.allMemories = all;
    mockState.memories = all;
    mockState.totalCount = all.length;

    render(<MemoriesAlbum onBack={() => {}} />);

    expect(screen.getByText("Por que o céu é azul?")).toBeInTheDocument();
    expect(screen.getByText("A aventura de Theo na floresta")).toBeInTheDocument();
    expect(screen.getByText("Caça às Emoções")).toBeInTheDocument();
    // Conquistas da família derivadas de profile (questions_used >= 1)
    expect(screen.getByText("Primeiros Passos")).toBeInTheDocument();
  });

  it("FILTRO: clicar em 'Histórias' chama setFilter('story')", () => {
    const all: Memory[] = [
      makeMemory("1", "question", "Pergunta A"),
      makeMemory("2", "story", "História B"),
    ];
    mockState.allMemories = all;
    mockState.memories = all;
    mockState.totalCount = 2;

    render(<MemoriesAlbum onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Histórias/i }));
    expect(setFilterMock).toHaveBeenCalledWith("story");
  });

  it("FILTRO Conquistas: clicar no chip 'Conquistas' chama setFilter('achievement')", () => {
    const all: Memory[] = [
      makeMemory("1", "question", "Pergunta A"),
      makeMemory("2", "achievement", "Primeira semana completa"),
    ];
    mockState.allMemories = all;
    mockState.memories = all;
    mockState.totalCount = 2;

    render(<MemoriesAlbum onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Conquistas/i }));
    expect(setFilterMock).toHaveBeenCalledWith("achievement");
  });

  it("PONTOS reais do profile aparecem no hero", () => {
    mockState.totalCount = 1;
    mockState.memories = [makeMemory("1", "question", "Oi")];
    mockState.allMemories = mockState.memories;
    render(<MemoriesAlbum onBack={() => {}} />);
    expect(screen.getByText("320")).toBeInTheDocument();
  });
});
