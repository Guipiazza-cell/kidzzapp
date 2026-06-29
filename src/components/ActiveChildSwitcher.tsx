import { ChevronDown } from "lucide-react";
import { useActiveChild } from "@/contexts/ActiveChildContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ActiveChildSwitcher() {
  const { criancas, activeChildId, setActiveChildId } = useActiveChild();

  if (criancas.length <= 1 || !activeChildId) return null;

  return (
    <div
      className="fixed left-4 z-50"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      <Select value={activeChildId} onValueChange={setActiveChildId}>
        <SelectTrigger className="h-11 w-auto min-w-[132px] max-w-[220px] rounded-full border-white/60 bg-white/85 px-3 shadow-lg backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kid-yellow text-xs font-black text-kid-brown">
              {criancas.find((crianca) => crianca.id === activeChildId)?.nome?.[0]?.toUpperCase() ?? "K"}
            </span>
            <SelectValue />
            <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
          </div>
        </SelectTrigger>
        <SelectContent align="start">
          {criancas.map((crianca) => (
            <SelectItem key={crianca.id} value={crianca.id}>
              {crianca.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
