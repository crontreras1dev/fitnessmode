export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          description: string | null;
          id: number;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          description?: string | null;
          id?: never;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          description?: string | null;
          id?: never;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      cities: {
        Row: {
          country_code: string;
          created_at: string;
          id: number;
          is_published: boolean;
          latitude: number | null;
          longitude: number | null;
          name: string;
          region: string | null;
          slug: string;
        };
        Insert: {
          country_code: string;
          created_at?: string;
          id?: never;
          is_published?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          region?: string | null;
          slug: string;
        };
        Update: {
          country_code?: string;
          created_at?: string;
          id?: never;
          is_published?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          region?: string | null;
          slug?: string;
        };
        Relationships: [];
      };
      modalities: {
        Row: {
          id: number;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          id?: never;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          id?: never;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      profile_categories: {
        Row: {
          category_id: number;
          profile_id: string;
        };
        Insert: {
          category_id: number;
          profile_id: string;
        };
        Update: {
          category_id?: number;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_categories_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_events: {
        Row: {
          created_at: string;
          event_type: Database["public"]["Enums"]["profile_event_type"];
          id: number;
          profile_id: string;
          referrer: string | null;
          target: Database["public"]["Enums"]["profile_click_target"] | null;
        };
        Insert: {
          created_at?: string;
          event_type: Database["public"]["Enums"]["profile_event_type"];
          id?: never;
          profile_id: string;
          referrer?: string | null;
          target?: Database["public"]["Enums"]["profile_click_target"] | null;
        };
        Update: {
          created_at?: string;
          event_type?: Database["public"]["Enums"]["profile_event_type"];
          id?: never;
          profile_id?: string;
          referrer?: string | null;
          target?: Database["public"]["Enums"]["profile_click_target"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "profile_events_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_modalities: {
        Row: {
          modality_id: number;
          profile_id: string;
        };
        Insert: {
          modality_id: number;
          profile_id: string;
        };
        Update: {
          modality_id?: number;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_modalities_modality_id_fkey";
            columns: ["modality_id"];
            isOneToOne: false;
            referencedRelation: "modalities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_modalities_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_specialties: {
        Row: {
          profile_id: string;
          specialty_id: number;
        };
        Insert: {
          profile_id: string;
          specialty_id: number;
        };
        Update: {
          profile_id?: string;
          specialty_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "profile_specialties_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_specialties_specialty_id_fkey";
            columns: ["specialty_id"];
            isOneToOne: false;
            referencedRelation: "specialties";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          city_id: number;
          created_at: string;
          currency: string;
          display_name: string;
          headline: string | null;
          id: string;
          instagram_url: string | null;
          phone: string | null;
          rate_max: number | null;
          rate_min: number | null;
          search: unknown;
          slug: string;
          status: Database["public"]["Enums"]["profile_status"];
          tier: Database["public"]["Enums"]["profile_tier"];
          tiktok_url: string | null;
          updated_at: string;
          website_url: string | null;
          whatsapp: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          city_id: number;
          created_at?: string;
          currency?: string;
          display_name: string;
          headline?: string | null;
          id: string;
          instagram_url?: string | null;
          phone?: string | null;
          rate_max?: number | null;
          rate_min?: number | null;
          search?: never;
          slug: string;
          status?: Database["public"]["Enums"]["profile_status"];
          tier?: Database["public"]["Enums"]["profile_tier"];
          tiktok_url?: string | null;
          updated_at?: string;
          website_url?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          city_id?: number;
          created_at?: string;
          currency?: string;
          display_name?: string;
          headline?: string | null;
          id?: string;
          instagram_url?: string | null;
          phone?: string | null;
          rate_max?: number | null;
          rate_min?: number | null;
          search?: never;
          slug?: string;
          status?: Database["public"]["Enums"]["profile_status"];
          tier?: Database["public"]["Enums"]["profile_tier"];
          tiktok_url?: string | null;
          updated_at?: string;
          website_url?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
        ];
      };
      specialties: {
        Row: {
          id: number;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          id?: never;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          id?: never;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_profile_click_breakdown: {
        Args: { p_days?: number };
        Returns: {
          clicks: number;
          target: Database["public"]["Enums"]["profile_click_target"];
        }[];
      };
      get_profile_contact: {
        Args: { p_profile_id: string };
        Returns: {
          phone: string;
          whatsapp: string;
        }[];
      };
      get_profile_stats: {
        Args: { p_days?: number };
        Returns: {
          clicks: number;
          day: string;
          views: number;
        }[];
      };
      search_profiles: {
        Args: {
          p_category?: string;
          p_city?: string;
          p_limit?: number;
          p_modality?: string;
          p_offset?: number;
          p_query?: string;
          p_rate_max?: number;
          p_rate_min?: number;
          p_specialty?: string;
        };
        Returns: {
          id: string;
          total_count: number;
        }[];
      };
      slugify: { Args: { value: string }; Returns: string };
    };
    Enums: {
      profile_click_target: "instagram" | "tiktok" | "website" | "whatsapp" | "phone";
      profile_event_type: "view" | "click";
      profile_status: "pending" | "active" | "suspended";
      profile_tier: "free" | "pro";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      profile_click_target: ["instagram", "tiktok", "website", "whatsapp", "phone"],
      profile_event_type: ["view", "click"],
      profile_status: ["pending", "active", "suspended"],
      profile_tier: ["free", "pro"],
    },
  },
} as const;
