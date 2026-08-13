import { useState } from "react";
import { savePin } from "@/lib/parentalPin";
import { haptic } from "@/lib/haptics";

interface PinSetupFormProps {
  /** Chamado após o PIN ser salvo com sucesso. */
  onSaved: () => void;
  saveLabel?: string;
}

/** Dois campos de 4 dígitos (novo PIN + confirmar). Reutilizado em onboarding,
 *  Área dos Pais e recuperação por e-mail. */
export const PinSetupForm = ({
  onSaved,
  saveLabel = "Salvar PIN",
}: PinSetupFormProps) => {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const mismatch =
    newPin.length === 4 && confirmPin.length === 4 && newPin !== confirmPin;
  const canSave = /^\d{4}$/.test(newPin) && newPin === confirmPin && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    let ok = false;
    try {
      ok = await savePin(newPin);
    } catch {
      ok = false;
    }
    setSaving(false);
    if (!ok) {
      setSaveError(
        "Não conseguimos salvar o PIN neste aparelho. Saia do modo privado do navegador e tente de novo."
      );
      return;
    }
    haptic("success");
    setNewPin("");
    setConfirmPin("");
    onSaved();
  };

  const clean = (v: string) => v.replace(/\D/g, "").slice(0, 4);

  return (
    <div>
      {noAccountWarning && (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-2xl px-4 py-3 mb-4 text-center leading-relaxed">
          Como você não criou uma conta, se esquecer esse PIN não tem como
          recuperar por e-mail — só reinstalando o app.
        </p>
      )}
      <label className="sr-only" htmlFor="pin-new">Novo PIN</label>
      <input
        id="pin-new"
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={newPin}
        onChange={(e) => setNewPin(clean(e.target.value))}
        placeholder="Novo PIN"
        className="w-full py-3 px-4 rounded-2xl bg-muted text-foreground text-center text-2xl tracking-widest font-bold mb-3 min-h-[48px]"
      />
      <label className="sr-only" htmlFor="pin-confirm">Confirmar PIN</label>
      <input
        id="pin-confirm"
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={confirmPin}
        onChange={(e) => setConfirmPin(clean(e.target.value))}
        placeholder="Confirmar PIN"
        className="w-full py-3 px-4 rounded-2xl bg-muted text-foreground text-center text-2xl tracking-widest font-bold mb-4 min-h-[48px]"
      />
      {mismatch && (
        <p className="text-sm font-bold text-destructive text-center mb-3">
          Os PINs não coincidem.
        </p>
      )}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm disabled:opacity-50 min-h-[48px]"
      >
        {saving ? "Salvando..." : saveLabel}
      </button>
    </div>
  );
};

export default PinSetupForm;
