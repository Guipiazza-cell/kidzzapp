export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          categoria: string
          contexto: string | null
          created_at: string | null
          curiosidade: string | null
          duracao_min: number | null
          emoji: string
          energia: string | null
          gancho: string | null
          id: string
          materiais: Json | null
          origem: string | null
          passos: Json | null
          tela_min: number | null
          tempo: string | null
          titulo: string
        }
        Insert: {
          categoria: string
          contexto?: string | null
          created_at?: string | null
          curiosidade?: string | null
          duracao_min?: number | null
          emoji: string
          energia?: string | null
          gancho?: string | null
          id?: string
          materiais?: Json | null
          origem?: string | null
          passos?: Json | null
          tela_min?: number | null
          tempo?: string | null
          titulo: string
        }
        Update: {
          categoria?: string
          contexto?: string | null
          created_at?: string | null
          curiosidade?: string | null
          duracao_min?: number | null
          emoji?: string
          energia?: string | null
          gancho?: string | null
          id?: string
          materiais?: Json | null
          origem?: string | null
          passos?: Json | null
          tela_min?: number | null
          tempo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          affiliate_code: string
          commission_rate: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          affiliate_code: string
          commission_rate?: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string
          commission_rate?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_code: string
          challenged_id: string | null
          challenged_progress: boolean[]
          challenger_id: string
          challenger_progress: boolean[]
          created_at: string
          id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          challenge_code: string
          challenged_id?: string | null
          challenged_progress?: boolean[]
          challenger_id: string
          challenger_progress?: boolean[]
          created_at?: string
          id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          challenge_code?: string
          challenged_id?: string | null
          challenged_progress?: boolean[]
          challenger_id?: string
          challenger_progress?: boolean[]
          created_at?: string
          id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      character_profiles: {
        Row: {
          color_from: string
          color_to: string
          created_at: string
          dominant_trait: string
          emotional_state: string
          energy_mode: string
          evolution_points: number
          expression: string
          games_count: number
          id: string
          last_feedback: string | null
          level: number
          moments_count: number
          outfit: string
          questions_count: number
          stories_count: number
          unlocked_colors: string[]
          unlocked_outfits: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          color_from?: string
          color_to?: string
          created_at?: string
          dominant_trait?: string
          emotional_state?: string
          energy_mode?: string
          evolution_points?: number
          expression?: string
          games_count?: number
          id?: string
          last_feedback?: string | null
          level?: number
          moments_count?: number
          outfit?: string
          questions_count?: number
          stories_count?: number
          unlocked_colors?: string[]
          unlocked_outfits?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          color_from?: string
          color_to?: string
          created_at?: string
          dominant_trait?: string
          emotional_state?: string
          energy_mode?: string
          evolution_points?: number
          expression?: string
          games_count?: number
          id?: string
          last_feedback?: string | null
          level?: number
          moments_count?: number
          outfit?: string
          questions_count?: number
          stories_count?: number
          unlocked_colors?: string[]
          unlocked_outfits?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conclusoes: {
        Row: {
          activity_id: string | null
          crianca_id: string | null
          feito_em: string | null
          foto_url: string | null
          id: string
          tela_min: number | null
          titulo_snapshot: string | null
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          crianca_id?: string | null
          feito_em?: string | null
          foto_url?: string | null
          id?: string
          tela_min?: number | null
          titulo_snapshot?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string | null
          crianca_id?: string | null
          feito_em?: string | null
          foto_url?: string | null
          id?: string
          tela_min?: number | null
          titulo_snapshot?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conclusoes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conclusoes_crianca_id_fkey"
            columns: ["crianca_id"]
            isOneToOne: false
            referencedRelation: "criancas"
            referencedColumns: ["id"]
          },
        ]
      }
      criancas: {
        Row: {
          created_at: string | null
          id: string
          idade: number | null
          interesses: string[] | null
          materiais_em_casa: string[] | null
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          idade?: number | null
          interesses?: string[] | null
          materiais_em_casa?: string[] | null
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          idade?: number | null
          interesses?: string[] | null
          materiais_em_casa?: string[] | null
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      desafios_semanais: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          emoji: string
          hashtag: string
          id: string
          semana_iso: string
          titulo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao: string
          emoji?: string
          hashtag?: string
          id?: string
          semana_iso: string
          titulo: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          emoji?: string
          hashtag?: string
          id?: string
          semana_iso?: string
          titulo?: string
        }
        Relationships: []
      }
      favoritos: {
        Row: {
          activity_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      indicacoes: {
        Row: {
          codigo: string
          convidado_id: string | null
          created_at: string | null
          id: string
          indicador_id: string
          recompensado: boolean | null
        }
        Insert: {
          codigo: string
          convidado_id?: string | null
          created_at?: string | null
          id?: string
          indicador_id: string
          recompensado?: boolean | null
        }
        Update: {
          codigo?: string
          convidado_id?: string | null
          created_at?: string | null
          id?: string
          indicador_id?: string
          recompensado?: boolean | null
        }
        Relationships: []
      }
      kidzz_questions_log: {
        Row: {
          age_range: string | null
          answer: string
          created_at: string
          id: string
          question: string
          user_id: string
          was_narrated: boolean
        }
        Insert: {
          age_range?: string | null
          answer: string
          created_at?: string
          id?: string
          question: string
          user_id: string
          was_narrated?: boolean
        }
        Update: {
          age_range?: string | null
          answer?: string
          created_at?: string
          id?: string
          question?: string
          user_id?: string
          was_narrated?: boolean
        }
        Relationships: []
      }
      memories: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_special: boolean
          metadata: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_special?: boolean
          metadata?: Json | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_special?: boolean
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notificacao_prefs: {
        Row: {
          ativo: boolean
          hora: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          hora?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          hora?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string | null
          child_interests: string[]
          child_name: string
          created_at: string
          id: string
          is_admin: boolean
          is_premium: boolean
          last_streak_date: string | null
          last_usage_date: string
          level: string
          plan_end_date: string | null
          points: number
          premium_source: string | null
          questions_used: number
          stories_used: number
          streak_days: number
          tier: string
          updated_at: string
          voice_enabled: boolean
        }
        Insert: {
          age_range?: string | null
          child_interests?: string[]
          child_name?: string
          created_at?: string
          id: string
          is_admin?: boolean
          is_premium?: boolean
          last_streak_date?: string | null
          last_usage_date?: string
          level?: string
          plan_end_date?: string | null
          points?: number
          premium_source?: string | null
          questions_used?: number
          stories_used?: number
          streak_days?: number
          tier?: string
          updated_at?: string
          voice_enabled?: boolean
        }
        Update: {
          age_range?: string | null
          child_interests?: string[]
          child_name?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          is_premium?: boolean
          last_streak_date?: string | null
          last_usage_date?: string
          level?: string
          plan_end_date?: string | null
          points?: number
          premium_source?: string | null
          questions_used?: number
          stories_used?: number
          streak_days?: number
          tier?: string
          updated_at?: string
          voice_enabled?: boolean
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          months_earned: number
          months_used: number
          referred_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          months_earned?: number
          months_used?: number
          referred_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          months_earned?: number
          months_used?: number
          referred_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          affiliate_id: string
          amount_paid: number
          commission_amount: number
          created_at: string
          id: string
          plan: string
          referred_user_id: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          amount_paid: number
          commission_amount: number
          created_at?: string
          id?: string
          plan: string
          referred_user_id?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount_paid?: number
          commission_amount?: number
          created_at?: string
          id?: string
          plan?: string
          referred_user_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage: {
        Row: {
          date: string
          historias_count: number
          perguntas_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          date: string
          historias_count?: number
          perguntas_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          date?: string
          historias_count?: number
          perguntas_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aplicar_indicacao: { Args: { _codigo: string }; Returns: Json }
      ensure_indicacao_codigo: { Args: never; Returns: string }
      get_bora_stats: {
        Args: never
        Returns: {
          categorias_exploradas: number
          streak: number
          total_conclusoes: number
          total_minutos: number
        }[]
      }
      get_effective_plan: {
        Args: { _user_id: string }
        Returns: {
          current_period_end: string
          in_grace: boolean
          plan: string
          status: string
        }[]
      }
      increment_usage: {
        Args: { _tipo: string }
        Returns: {
          allowed: boolean
          historias_count: number
          perguntas_count: number
          plan: string
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
