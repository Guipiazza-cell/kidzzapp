/**
 * Validação manual automatizada — Botões SALVAR / COMPARTILHAR
 *
 * Cobre comportamento real esperado em iOS e Android:
 *  - SALVAR grava `mascotConfig` no localStorage e dá feedback (toast/confetti).
 *  - COMPARTILHAR usa Web Share API quando disponível (iOS Safari / Android Chrome),
 *    e cai em download de PNG quando não há suporte (desktop / iOS antigo).
 *  - Itens bloqueados (premium) NÃO alteram a config quando o usuário é free,
 *    e mostram um aviso (toast.info) — sem quebrar o app.
 *
 * Mockamos `html2canvas`, `canvas-confetti`, `sonner` e `useAuth` para isolar a UI.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

// --- Mocks globais ---
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
vi.mock("html2canvas", () => ({
  default: vi.fn(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    // toBlob mockado
    (canvas as any).toBlob = (cb: (b: Blob | null) => void) =>
      cb(new Blob(["fake-png"], { type: "image/png" }));
    return canvas;
  }),
}));

const toastMock = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};
vi.mock("sonner", () => ({ toast: toastMock, Toaster: () => null }));

// useAuth mock — controlado por variável externa
let mockProfile: { is_premium: boolean; child_name: string } | null = {
  is_premium: false,
  child_name: "Lia",
};
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ profile: mockProfile }),
}));

import MyKidzz from "@/components/play/MyKidzz";

const KEY = "mascotConfig";

describe("MyKidzz — botões SALVAR e COMPARTILHAR", () => {
  beforeEach(() => {
    localStorage.clear();
    toastMock.success.mockClear();
    toastMock.error.mockClear();
    toastMock.info.mockClear();
    mockProfile = { is_premium: false, child_name: "Lia" };
  });

  afterEach(() => {
    cleanup();
  });

  it("SALVAR escreve a config atual em localStorage e mostra toast de sucesso", () => {
    render(<MyKidzz onBack={() => {}} />);

    const saveBtn = screen.getByRole("button", { name: /salvar/i });
    fireEvent.click(saveBtn);

    const stored = localStorage.getItem(KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.colorId).toBeDefined();
    expect(parsed.expression).toBeDefined();
    expect(toastMock.success).toHaveBeenCalledWith(expect.stringContaining("Lia"));
  });

  it("COMPARTILHAR usa Web Share API quando navigator.canShare retorna true (iOS/Android)", async () => {
    const shareSpy = vi.fn(async () => {});
    Object.defineProperty(window.navigator, "canShare", {
      configurable: true,
      value: () => true,
    });
    Object.defineProperty(window.navigator, "share", {
      configurable: true,
      value: shareSpy,
    });

    render(<MyKidzz onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /compartilhar/i }));

    await waitFor(() => expect(shareSpy).toHaveBeenCalled());
    const arg = (shareSpy.mock.calls as any[])[0][0] as { files: File[]; title: string };
    expect(arg.files[0]).toBeInstanceOf(File);
    expect(arg.title).toMatch(/KIDZZ/i);
    expect(toastMock.success).toHaveBeenCalled();
  });

  it("COMPARTILHAR cai em download PNG quando Web Share não está disponível (desktop)", async () => {
    Object.defineProperty(window.navigator, "canShare", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window.navigator, "share", {
      configurable: true,
      value: undefined,
    });

    // Mock URL.createObjectURL
    const createUrl = vi.fn(() => "blob:fake");
    const revokeUrl = vi.fn();
    (URL as any).createObjectURL = createUrl;
    (URL as any).revokeObjectURL = revokeUrl;

    render(<MyKidzz onBack={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /compartilhar/i }));

    await waitFor(() => expect(createUrl).toHaveBeenCalled());
    expect(toastMock.success).toHaveBeenCalledWith(expect.stringMatching(/baixada/i));
    expect(revokeUrl).toHaveBeenCalled();
  });

  it("usuário FREE NÃO consegue selecionar expressão bloqueada — mostra aviso premium", () => {
    mockProfile = { is_premium: false, child_name: "Lia" };
    render(<MyKidzz onBack={() => {}} />);

    // Vai para a aba Expressão
    fireEvent.click(screen.getByRole("button", { name: /expressão/i }));

    // "Amoroso" está bloqueado para free (index 4 nas EXPRESSIONS de MyKidzz)
    const lockedBtn = screen.getByRole("button", { name: /amoroso/i });
    fireEvent.click(lockedBtn);

    expect(toastMock.info).toHaveBeenCalledWith(expect.stringMatching(/Premium/i));

    // Salvar agora — config NÃO deve ter sido alterada para "loving"
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));
    const saved = JSON.parse(localStorage.getItem(KEY)!);
    expect(saved.expression).not.toBe("loving");
  });

  it("usuário PREMIUM consegue selecionar itens bloqueados normalmente", () => {
    mockProfile = { is_premium: true, child_name: "Lia" };
    render(<MyKidzz onBack={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /expressão/i }));
    fireEvent.click(screen.getByRole("button", { name: /amoroso/i }));
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    const saved = JSON.parse(localStorage.getItem(KEY)!);
    expect(saved.expression).toBe("loving");
    expect(toastMock.info).not.toHaveBeenCalled();
  });
});
