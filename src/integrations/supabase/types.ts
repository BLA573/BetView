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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string
          name: string
          email: string | null
          website: string | null
          logo_url: string | null
          description: string | null
          phone: string
          address: string | null
          license_number: string | null
          status: string
          plan_tier: string
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          website?: string | null
          logo_url?: string | null
          description?: string | null
          phone?: string
          address?: string | null
          license_number?: string | null
          status?: string
          plan_tier?: string
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          website?: string | null
          logo_url?: string | null
          description?: string | null
          phone?: string
          address?: string | null
          license_number?: string | null
          status?: string
          plan_tier?: string
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      agency_members: {
        Row: {
          id: string
          user_id: string
          agency_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agency_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agency_id?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      featured_listings: {
        Row: {
          id: string
          property_id: string
          agency_id: string
          duration_days: number | null
          price: number
          status: string | null
          approved_by: string | null
          start_date: string | null
          end_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          agency_id: string
          duration_days?: number | null
          price: number
          status?: string | null
          approved_by?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          agency_id?: string
          duration_days?: number | null
          price?: number
          status?: string | null
          approved_by?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_listings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          property_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string
          name: string
          phone?: string | null
          property_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          property_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_blocked: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_blocked?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_blocked?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          dashboard_demo_source: string | null
          dashboard_demo_tour_url: string | null
          featured_property_id: string | null
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dashboard_demo_source?: string | null
          dashboard_demo_tour_url?: string | null
          featured_property_id?: string | null
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dashboard_demo_source?: string | null
          dashboard_demo_tour_url?: string | null
          featured_property_id?: string | null
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      premium_requests: {
        Row: {
          id: string
          user_id: string
          status: string
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          approved_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          agency_id: string | null
          available: string
          base_rent: string | null
          created_at: string
          description: string
          id: string
          images: string[]
          is_verified: boolean
          is_featured: boolean
          lat: number
          living_space: string | null
          lng: number
          location: string
          mode: string
          price: string
          price_per_sqm: string | null
          property_size: string | null
          rooms: number
          status: string
          surroundings: string | null
          title: string
          tour_url: string | null
          transport: string | null
          type: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          available?: string
          base_rent?: string | null
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          is_verified?: boolean
          is_featured?: boolean
          lat?: number
          living_space?: string | null
          lng?: number
          location?: string
          mode?: string
          price?: string
          price_per_sqm?: string | null
          property_size?: string | null
          rooms?: number
          status?: string
          surroundings?: string | null
          title: string
          tour_url?: string | null
          transport?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          available?: string
          base_rent?: string | null
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          is_verified?: boolean
          is_featured?: boolean
          lat?: number
          living_space?: string | null
          lng?: number
          location?: string
          mode?: string
          price?: string
          price_per_sqm?: string | null
          property_size?: string | null
          rooms?: number
          status?: string
          surroundings?: string | null
          title?: string
          tour_url?: string | null
          transport?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          reason: string
          reporter_id: string
          resolved_by: string | null
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          resolved_by?: string | null
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolved_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_properties: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_alerts: {
        Row: {
          id: string
          user_id: string
          property_id: string
          alert_type: string | null
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          alert_type?: string | null
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          alert_type?: string | null
          enabled?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      register_agency_account: {
        Args: {
          _email?: string | null
          _license_number?: string | null
          _name: string
          _phone: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      get_user_agency_id: {
        Args: {
          _user_id: string
        }
        Returns: string | null
      }
    }
    Enums: {
      app_role: "admin" | "agency" | "premium_buyer" | "user"
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
    Enums: {
      app_role: ["admin", "agency", "premium_buyer", "user"],
    },
  },
} as const
