export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          country: string
          created_at: string | null
          id: string
          latitude: number | null
          launch_status: Database["public"]["Enums"]["launch_status"] | null
          longitude: number | null
          name: string
        }
        Insert: {
          country: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          launch_status?: Database["public"]["Enums"]["launch_status"] | null
          longitude?: number | null
          name: string
        }
        Update: {
          country?: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          launch_status?: Database["public"]["Enums"]["launch_status"] | null
          longitude?: number | null
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          city: string | null
          city_id: string | null
          created_at: string | null
          currency: string | null
          date: string | null
          description: string | null
          event_type: string | null
          event_url: string | null
          genre: string | null
          going: number | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          organizer_id: string | null
          organizer_name: string | null
          popularity_score: number | null
          price_max: number | null
          price_min: number | null
          sales_velocity: number | null
          share_count: number | null
          source_id: string | null
          source_url: string | null
          student_event: boolean | null
          ticket_price: number | null
          ticket_url: string | null
          tickets_sold: number | null
          time: string | null
          title: string
          updated_at: string | null
          venue_address: string | null
          venue_name: string | null
          view_count: number | null
          visibility: Database["public"]["Enums"]["event_visibility"] | null
        }
        Insert: {
          capacity?: number | null
          city?: string | null
          city_id?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          description?: string | null
          event_type?: string | null
          event_url?: string | null
          genre?: string | null
          going?: number | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organizer_id?: string | null
          organizer_name?: string | null
          popularity_score?: number | null
          price_max?: number | null
          price_min?: number | null
          sales_velocity?: number | null
          share_count?: number | null
          source_id?: string | null
          source_url?: string | null
          student_event?: boolean | null
          ticket_price?: number | null
          ticket_url?: string | null
          tickets_sold?: number | null
          time?: string | null
          title: string
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string | null
          view_count?: number | null
          visibility?: Database["public"]["Enums"]["event_visibility"] | null
        }
        Update: {
          capacity?: number | null
          city?: string | null
          city_id?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          description?: string | null
          event_type?: string | null
          event_url?: string | null
          genre?: string | null
          going?: number | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organizer_id?: string | null
          organizer_name?: string | null
          popularity_score?: number | null
          price_max?: number | null
          price_min?: number | null
          sales_velocity?: number | null
          share_count?: number | null
          source_id?: string | null
          source_url?: string | null
          student_event?: boolean | null
          ticket_price?: number | null
          ticket_url?: string | null
          tickets_sold?: number | null
          time?: string | null
          title?: string
          updated_at?: string | null
          venue_address?: string | null
          venue_name?: string | null
          view_count?: number | null
          visibility?: Database["public"]["Enums"]["event_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      events_archive: {
        Row: {
          archived_at: string | null
          city_id: string | null
          created_at: string | null
          currency: string | null
          date: string | null
          description: string | null
          event_type: string | null
          event_url: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          organizer_id: string | null
          popularity_score: number | null
          price_max: number | null
          price_min: number | null
          source_id: string | null
          source_url: string | null
          ticket_price: number | null
          ticket_url: string | null
          time: string | null
          title: string | null
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          archived_at?: string | null
          city_id?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          description?: string | null
          event_type?: string | null
          event_url?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          organizer_id?: string | null
          popularity_score?: number | null
          price_max?: number | null
          price_min?: number | null
          source_id?: string | null
          source_url?: string | null
          ticket_price?: number | null
          ticket_url?: string | null
          time?: string | null
          title?: string | null
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          archived_at?: string | null
          city_id?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          description?: string | null
          event_type?: string | null
          event_url?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          organizer_id?: string | null
          popularity_score?: number | null
          price_max?: number | null
          price_min?: number | null
          source_id?: string | null
          source_url?: string | null
          ticket_price?: number | null
          ticket_url?: string | null
          time?: string | null
          title?: string | null
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_archive_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_archive_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_archive_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      extraction_jobs: {
        Row: {
          city_id: string | null
          country: string | null
          created_at: string | null
          duplicates_skipped: number | null
          errors: Json | null
          events_discovered: number | null
          events_extracted: number | null
          id: string
          past_events_skipped: number | null
          processed_sources: number | null
          status: Database["public"]["Enums"]["extraction_job_status"] | null
          total_sources: number | null
          updated_at: string | null
          use_deep_extract: boolean | null
        }
        Insert: {
          city_id?: string | null
          country?: string | null
          created_at?: string | null
          duplicates_skipped?: number | null
          errors?: Json | null
          events_discovered?: number | null
          events_extracted?: number | null
          id?: string
          past_events_skipped?: number | null
          processed_sources?: number | null
          status?: Database["public"]["Enums"]["extraction_job_status"] | null
          total_sources?: number | null
          updated_at?: string | null
          use_deep_extract?: boolean | null
        }
        Update: {
          city_id?: string | null
          country?: string | null
          created_at?: string | null
          duplicates_skipped?: number | null
          errors?: Json | null
          events_discovered?: number | null
          events_extracted?: number | null
          id?: string
          past_events_skipped?: number | null
          processed_sources?: number | null
          status?: Database["public"]["Enums"]["extraction_job_status"] | null
          total_sources?: number | null
          updated_at?: string | null
          use_deep_extract?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "extraction_jobs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string | null
          id: string
          status: Database["public"]["Enums"]["friendship_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      moments: {
        Row: {
          caption: string | null
          created_at: string | null
          event_id: string | null
          hidden: boolean | null
          id: string
          media_type: string | null
          media_url: string
          reported: boolean | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          event_id?: string | null
          hidden?: boolean | null
          id?: string
          media_type?: string | null
          media_url: string
          reported?: boolean | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          event_id?: string | null
          hidden?: boolean | null
          id?: string
          media_type?: string | null
          media_url?: string
          reported?: boolean | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      organizers: {
        Row: {
          city_id: string | null
          contact_page: string | null
          contact_status: Database["public"]["Enums"]["contact_status"] | null
          country: string | null
          created_at: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          name: string
          permission_status: Database["public"]["Enums"]["permission_status"] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          city_id?: string | null
          contact_page?: string | null
          contact_status?: Database["public"]["Enums"]["contact_status"] | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name: string
          permission_status?: Database["public"]["Enums"]["permission_status"] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          city_id?: string | null
          contact_page?: string | null
          contact_status?: Database["public"]["Enums"]["contact_status"] | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string
          permission_status?: Database["public"]["Enums"]["permission_status"] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_campaigns: {
        Row: {
          body: string | null
          city: string | null
          country: string | null
          created_at: string | null
          goal: string | null
          id: string
          name: string
          offer: string | null
          signature: string | null
          status_filter: string | null
          subject: string | null
          tone: string | null
        }
        Insert: {
          body?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          goal?: string | null
          id?: string
          name: string
          offer?: string | null
          signature?: string | null
          status_filter?: string | null
          subject?: string | null
          tone?: string | null
        }
        Update: {
          body?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          goal?: string | null
          id?: string
          name?: string
          offer?: string | null
          signature?: string | null
          status_filter?: string | null
          subject?: string | null
          tone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          language: string | null
          name: string | null
          organizer_role: boolean | null
          profile_photo: string | null
          student_verified: boolean | null
          university: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          language?: string | null
          name?: string | null
          organizer_role?: boolean | null
          profile_photo?: string | null
          student_verified?: boolean | null
          university?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          language?: string | null
          name?: string | null
          organizer_role?: boolean | null
          profile_photo?: string | null
          student_verified?: boolean | null
          university?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sources: {
        Row: {
          approved: boolean | null
          city_id: string | null
          crawl_frequency: Database["public"]["Enums"]["crawl_frequency"] | null
          created_at: string | null
          id: string
          last_crawled_at: string | null
          name: string
          source_type: Database["public"]["Enums"]["source_type"] | null
          updated_at: string | null
          url: string
        }
        Insert: {
          approved?: boolean | null
          city_id?: string | null
          crawl_frequency?: Database["public"]["Enums"]["crawl_frequency"] | null
          created_at?: string | null
          id?: string
          last_crawled_at?: string | null
          name: string
          source_type?: Database["public"]["Enums"]["source_type"] | null
          updated_at?: string | null
          url: string
        }
        Update: {
          approved?: boolean | null
          city_id?: string | null
          crawl_frequency?: Database["public"]["Enums"]["crawl_frequency"] | null
          created_at?: string | null
          id?: string
          last_crawled_at?: string | null
          name?: string
          source_type?: Database["public"]["Enums"]["source_type"] | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          checkin_time: string | null
          created_at: string | null
          event_id: string | null
          id: string
          purchase_time: string | null
          qr_code: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          user_id: string | null
        }
        Insert: {
          checkin_time?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          purchase_time?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          user_id?: string | null
        }
        Update: {
          checkin_time?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          purchase_time?: string | null
          qr_code?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_ticket_sold: {
        Args: { event_id_input: string }
        Returns: undefined
      }
    }
    Enums: {
      contact_status: "not_contacted" | "contacted" | "replied" | "approved" | "rejected"
      crawl_frequency: "hourly" | "every_6_hours" | "daily" | "weekly"
      event_visibility: "public" | "private" | "student_only" | "invite_only"
      extraction_job_status: "queued" | "running" | "completed" | "failed" | "cancelled"
      friendship_status: "pending" | "accepted" | "rejected"
      launch_status: "active" | "pending" | "inactive"
      permission_status: "pending" | "approved" | "denied"
      source_type: "ticket_platform" | "venue_website" | "social_media" | "event_aggregator" | "blog" | "other"
      ticket_status: "valid" | "used" | "cancelled"
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
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contact_status: ["not_contacted", "contacted", "replied", "approved", "rejected"],
      crawl_frequency: ["hourly", "every_6_hours", "daily", "weekly"],
      event_visibility: ["public", "private", "student_only", "invite_only"],
      extraction_job_status: ["queued", "running", "completed", "failed", "cancelled"],
      friendship_status: ["pending", "accepted", "rejected"],
      launch_status: ["active", "pending", "inactive"],
      permission_status: ["pending", "approved", "denied"],
      source_type: ["ticket_platform", "venue_website", "social_media", "event_aggregator", "blog", "other"],
      ticket_status: ["valid", "used", "cancelled"],
    },
  },
} as const
