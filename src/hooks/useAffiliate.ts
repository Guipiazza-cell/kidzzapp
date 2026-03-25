import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAffiliate = () => {
  const { user } = useAuth();
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Capture ref from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      sessionStorage.setItem("kidzz_ref", ref);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  // Fetch existing affiliate code
  useEffect(() => {
    if (!user) return;
    supabase
      .from("affiliates")
      .select("affiliate_code")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAffiliateCode(data.affiliate_code);
      });
  }, [user]);

  const generateCode = useCallback(async (customCode: string) => {
    if (!user) return { error: "Faça login primeiro" };
    setLoading(true);
    try {
      const code = customCode.toLowerCase().replace(/[^a-z0-9-_]/g, "");
      if (code.length < 3) return { error: "Código precisa ter pelo menos 3 caracteres" };

      const { error } = await supabase.from("affiliates").insert({
        user_id: user.id,
        affiliate_code: code,
      });

      if (error) {
        if (error.code === "23505") return { error: "Esse código já está em uso" };
        return { error: error.message };
      }

      setAffiliateCode(code);
      return { error: null };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getRefCode = () => sessionStorage.getItem("kidzz_ref") || null;

  return { affiliateCode, generateCode, loading, getRefCode };
};
