import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useChallenges = () => {
  const { user, profile } = useAuth();
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchActive = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("challenges")
      .select("*")
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .in("status", ["pending", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setActiveChallenge(data);
  }, [user]);

  useEffect(() => { fetchActive(); }, [fetchActive]);

  const createChallenge = useCallback(async () => {
    if (!user) return null;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from("challenges")
      .insert({
        challenger_id: user.id,
        challenge_code: code,
        status: "pending",
      })
      .select()
      .single();
    if (error) return null;
    setActiveChallenge(data);
    return data;
  }, [user]);

  const joinChallenge = useCallback(async (code: string) => {
    if (!user) return { error: "Login necessário" };
    const { data: challenge } = await supabase
      .from("challenges")
      .select("*")
      .eq("challenge_code", code.toUpperCase())
      .eq("status", "pending")
      .maybeSingle();
    if (!challenge) return { error: "Desafio não encontrado" };
    if (challenge.challenger_id === user.id) return { error: "Você não pode aceitar seu próprio desafio" };

    const { error } = await supabase
      .from("challenges")
      .update({
        challenged_id: user.id,
        status: "active",
        start_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", challenge.id);
    if (error) return { error: error.message };
    await fetchActive();
    return { error: null };
  }, [user, fetchActive]);

  const markDayComplete = useCallback(async () => {
    if (!user || !activeChallenge || activeChallenge.status !== "active") return;
    const isChallenger = activeChallenge.challenger_id === user.id;
    const progressField = isChallenger ? "challenger_progress" : "challenged_progress";
    const progress = [...(activeChallenge[progressField] || [])];
    
    // Find first incomplete day
    const dayIndex = progress.findIndex((v: boolean) => !v);
    if (dayIndex === -1) return;
    progress[dayIndex] = true;

    const updates: any = { [progressField]: progress };
    // Check if challenge is complete
    const otherProgress = isChallenger ? activeChallenge.challenged_progress : activeChallenge.challenger_progress;
    const allDone = progress.every(Boolean) && otherProgress?.every((v: boolean) => v);
    if (allDone) updates.status = "completed";

    await supabase.from("challenges").update(updates).eq("id", activeChallenge.id);
    await fetchActive();
  }, [user, activeChallenge, fetchActive]);

  // Should show challenge invite (streak >= 3, no active challenge)
  const shouldShowInvite = !activeChallenge && (profile?.streak_days ?? 0) >= 3;

  return { activeChallenge, createChallenge, joinChallenge, markDayComplete, shouldShowInvite, loading };
};
