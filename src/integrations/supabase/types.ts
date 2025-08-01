export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      columns: {
        Row: {
          created_at: string | null
          dimensions: string | null
          estimated_lifetime_injections: number | null
          first_use_date: string | null
          id: string
          manufacturer: string | null
          max_pressure: number | null
          max_temperature: number | null
          name: string
          notes: string | null
          part_number: string | null
          particle_size: string | null
          purchase_date: string | null
          stationary_phase: string | null
          status: Database["public"]["Enums"]["column_status"] | null
          total_injections: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dimensions?: string | null
          estimated_lifetime_injections?: number | null
          first_use_date?: string | null
          id?: string
          manufacturer?: string | null
          max_pressure?: number | null
          max_temperature?: number | null
          name: string
          notes?: string | null
          part_number?: string | null
          particle_size?: string | null
          purchase_date?: string | null
          stationary_phase?: string | null
          status?: Database["public"]["Enums"]["column_status"] | null
          total_injections?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dimensions?: string | null
          estimated_lifetime_injections?: number | null
          first_use_date?: string | null
          id?: string
          manufacturer?: string | null
          max_pressure?: number | null
          max_temperature?: number | null
          name?: string
          notes?: string | null
          part_number?: string | null
          particle_size?: string | null
          purchase_date?: string | null
          stationary_phase?: string | null
          status?: Database["public"]["Enums"]["column_status"] | null
          total_injections?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          created_by: string
          id: string
          template_html: string
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          template_html: string
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          template_html?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      guard_columns: {
        Row: {
          batch_number: string | null
          column_id: string
          created_at: string
          expected_lifetime_injections: number | null
          id: string
          installation_injection_count: number
          installed_date: string
          notes: string | null
          part_number: string
          removal_injection_count: number | null
          removed_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_number?: string | null
          column_id: string
          created_at?: string
          expected_lifetime_injections?: number | null
          id?: string
          installation_injection_count?: number
          installed_date: string
          notes?: string | null
          part_number: string
          removal_injection_count?: number | null
          removed_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_number?: string | null
          column_id?: string
          created_at?: string
          expected_lifetime_injections?: number | null
          id?: string
          installation_injection_count?: number
          installed_date?: string
          notes?: string | null
          part_number?: string
          removal_injection_count?: number | null
          removed_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guard_columns_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
        ]
      }
      injections: {
        Row: {
          batch_id: string | null
          batch_size: number | null
          column_id: string
          created_at: string | null
          id: string
          injection_date: string | null
          injection_number: number
          method_id: string
          notes: string | null
          pressure_reading: number | null
          run_successful: boolean | null
          sample_id: string | null
          temperature_reading: number | null
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          batch_size?: number | null
          column_id: string
          created_at?: string | null
          id?: string
          injection_date?: string | null
          injection_number: number
          method_id: string
          notes?: string | null
          pressure_reading?: number | null
          run_successful?: boolean | null
          sample_id?: string | null
          temperature_reading?: number | null
          user_id: string
        }
        Update: {
          batch_id?: string | null
          batch_size?: number | null
          column_id?: string
          created_at?: string | null
          id?: string
          injection_date?: string | null
          injection_number?: number
          method_id?: string
          notes?: string | null
          pressure_reading?: number | null
          run_successful?: boolean | null
          sample_id?: string | null
          temperature_reading?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "injections_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "injections_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "methods"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_custom_fields: {
        Row: {
          created_at: string | null
          field_label: string
          field_name: string
          field_order: number | null
          field_type: string
          id: string
          is_required: boolean | null
          select_options: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          field_label: string
          field_name: string
          field_order?: number | null
          field_type: string
          id?: string
          is_required?: boolean | null
          select_options?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          field_label?: string
          field_name?: string
          field_order?: number | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          select_options?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      maintenance_logs: {
        Row: {
          cost: number | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          id: string
          maintenance_date: string
          maintenance_type: string
          next_maintenance_date: string | null
          notes: string | null
          performed_by: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          id?: string
          maintenance_date?: string
          maintenance_type: string
          next_maintenance_date?: string | null
          notes?: string | null
          performed_by?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          id?: string
          maintenance_date?: string
          maintenance_type?: string
          next_maintenance_date?: string | null
          notes?: string | null
          performed_by?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      metabolites: {
        Row: {
          cas_number: string | null
          created_at: string | null
          formula: string | null
          id: string
          ionization_preference:
            | Database["public"]["Enums"]["method_type"]
            | null
          molecular_weight: number | null
          name: string
          notes: string | null
          retention_time_range: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cas_number?: string | null
          created_at?: string | null
          formula?: string | null
          id?: string
          ionization_preference?:
            | Database["public"]["Enums"]["method_type"]
            | null
          molecular_weight?: number | null
          name: string
          notes?: string | null
          retention_time_range?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cas_number?: string | null
          created_at?: string | null
          formula?: string | null
          id?: string
          ionization_preference?:
            | Database["public"]["Enums"]["method_type"]
            | null
          molecular_weight?: number | null
          name?: string
          notes?: string | null
          retention_time_range?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      method_metabolites: {
        Row: {
          column_id: string
          created_at: string | null
          id: string
          metabolite_id: string
          method_id: string
          notes: string | null
          peak_area_avg: number | null
          performance_rating: number | null
          precision_cv: number | null
          recovery_percent: number | null
          retention_time: number | null
          signal_to_noise: number | null
        }
        Insert: {
          column_id: string
          created_at?: string | null
          id?: string
          metabolite_id: string
          method_id: string
          notes?: string | null
          peak_area_avg?: number | null
          performance_rating?: number | null
          precision_cv?: number | null
          recovery_percent?: number | null
          retention_time?: number | null
          signal_to_noise?: number | null
        }
        Update: {
          column_id?: string
          created_at?: string | null
          id?: string
          metabolite_id?: string
          method_id?: string
          notes?: string | null
          peak_area_avg?: number | null
          performance_rating?: number | null
          precision_cv?: number | null
          recovery_percent?: number | null
          retention_time?: number | null
          signal_to_noise?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "method_metabolites_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "method_metabolites_metabolite_id_fkey"
            columns: ["metabolite_id"]
            isOneToOne: false
            referencedRelation: "metabolites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "method_metabolites_method_id_fkey"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "methods"
            referencedColumns: ["id"]
          },
        ]
      }
      methods: {
        Row: {
          column_id: string | null
          column_temperature: number | null
          created_at: string | null
          description: string | null
          flow_rate: number | null
          gradient_profile: string | null
          gradient_steps: Json | null
          id: string
          injection_volume: number | null
          ionization_mode: Database["public"]["Enums"]["method_type"]
          mobile_phase_a: string | null
          mobile_phase_b: string | null
          name: string
          run_time: number | null
          sample_type: Database["public"]["Enums"]["sample_type"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          column_id?: string | null
          column_temperature?: number | null
          created_at?: string | null
          description?: string | null
          flow_rate?: number | null
          gradient_profile?: string | null
          gradient_steps?: Json | null
          id?: string
          injection_volume?: number | null
          ionization_mode: Database["public"]["Enums"]["method_type"]
          mobile_phase_a?: string | null
          mobile_phase_b?: string | null
          name: string
          run_time?: number | null
          sample_type?: Database["public"]["Enums"]["sample_type"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          column_id?: string | null
          column_temperature?: number | null
          created_at?: string | null
          description?: string | null
          flow_rate?: number | null
          gradient_profile?: string | null
          gradient_steps?: Json | null
          id?: string
          injection_volume?: number | null
          ionization_mode?: Database["public"]["Enums"]["method_type"]
          mobile_phase_a?: string | null
          mobile_phase_b?: string | null
          name?: string
          run_time?: number | null
          sample_type?: Database["public"]["Enums"]["sample_type"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "methods_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          full_name: string | null
          id: string
          institution: string | null
          lab_name: string | null
          last_login_at: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id: string
          institution?: string | null
          lab_name?: string | null
          last_login_at?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          lab_name?: string | null
          last_login_at?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          created_at: string
          created_by: string
          from_email: string
          from_name: string
          id: string
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_username: string
          updated_at: string
          use_tls: boolean
        }
        Insert: {
          created_at?: string
          created_by: string
          from_email: string
          from_name?: string
          id?: string
          smtp_host: string
          smtp_password: string
          smtp_port?: number
          smtp_username: string
          updated_at?: string
          use_tls?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string
          from_email?: string
          from_name?: string
          id?: string
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_username?: string
          updated_at?: string
          use_tls?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      admin_create_user: {
        Args: {
          user_email: string
          user_password: string
          user_full_name?: string
          user_role?: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      get_all_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          institution: string
          lab_name: string
          phone: string
          department: string
          status: string
          created_at: string
          last_login_at: string
          roles: string[]
        }[]
      }
      get_dashboard_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_methods: number
          total_columns: number
          total_metabolites: number
          active_columns: number
          total_injections: number
          avg_column_usage: number
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      make_first_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      request_password_reset: {
        Args: { user_email: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      column_status: "active" | "retired" | "maintenance"
      method_type: "positive" | "negative" | "both"
      sample_type: "plasma" | "serum" | "urine" | "tissue" | "other"
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
      app_role: ["admin", "user"],
      column_status: ["active", "retired", "maintenance"],
      method_type: ["positive", "negative", "both"],
      sample_type: ["plasma", "serum", "urine", "tissue", "other"],
    },
  },
} as const
