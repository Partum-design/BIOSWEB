export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "patient" | "doctor" | "admin";
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: "patient" | "doctor" | "admin";
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: "patient" | "doctor" | "admin";
          avatar_url?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: never[];
      };
      patients: {
        Row: {
          id: string;
          profile_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          date_of_birth?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          updated_at?: string;
        };
        Relationships: never[];
      };
      doctors: {
        Row: {
          id: string;
          profile_id: string;
          professional_name: string;
          license_number: string | null;
          specialty: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          professional_name: string;
          license_number?: string | null;
          specialty?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          professional_name?: string;
          license_number?: string | null;
          specialty?: string | null;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: never[];
      };
      medical_results: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          title: string;
          study_type: string;
          result_date: string;
          status: "draft" | "published" | "sent" | "viewed" | "archived";
          file_path: string | null;
          lab_branch: string | null;
          notes_for_patient: string | null;
          internal_notes: string | null;
          created_by: string;
          published_at: string | null;
          viewed_at: string | null;
          downloaded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          title: string;
          study_type?: string;
          result_date?: string;
          status?: "draft" | "published" | "sent" | "viewed" | "archived";
          file_path?: string | null;
          lab_branch?: string | null;
          notes_for_patient?: string | null;
          internal_notes?: string | null;
          created_by: string;
          published_at?: string | null;
          viewed_at?: string | null;
          downloaded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          study_type?: string;
          result_date?: string;
          status?: "draft" | "published" | "sent" | "viewed" | "archived";
          file_path?: string | null;
          lab_branch?: string | null;
          notes_for_patient?: string | null;
          internal_notes?: string | null;
          published_at?: string | null;
          viewed_at?: string | null;
          downloaded_at?: string | null;
          updated_at?: string;
        };
        Relationships: never[];
      };
      result_access_links: {
        Row: {
          id: string;
          result_id: string;
          token_hash: string;
          expires_at: string | null;
          revoked_at: string | null;
          last_accessed_at: string | null;
          access_count: number;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          result_id: string;
          token_hash: string;
          expires_at?: string | null;
          revoked_at?: string | null;
          last_accessed_at?: string | null;
          access_count?: number;
          created_by: string;
          created_at?: string;
        };
        Update: {
          expires_at?: string | null;
          revoked_at?: string | null;
          last_accessed_at?: string | null;
          access_count?: number;
        };
        Relationships: never[];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_profile_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_profile_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: never;
        Relationships: never[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_doctor: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
