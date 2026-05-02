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
      ad_account_profiles: {
        Row: {
          accent_color: string | null
          ad_account_id: string
          brand_kit: Json | null
          brand_kit_status: string | null
          brand_kit_updated_at: string | null
          brand_name: string | null
          confirmed: boolean
          created_at: string
          facebook_page_id: string | null
          facebook_page_name: string | null
          font_family: string | null
          id: string
          industry: string | null
          logo_url: string | null
          primary_color: string | null
          product_categories: string[] | null
          secondary_color: string | null
          tagline: string | null
          tone_of_voice: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          accent_color?: string | null
          ad_account_id: string
          brand_kit?: Json | null
          brand_kit_status?: string | null
          brand_kit_updated_at?: string | null
          brand_name?: string | null
          confirmed?: boolean
          created_at?: string
          facebook_page_id?: string | null
          facebook_page_name?: string | null
          font_family?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          primary_color?: string | null
          product_categories?: string[] | null
          secondary_color?: string | null
          tagline?: string | null
          tone_of_voice?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          accent_color?: string | null
          ad_account_id?: string
          brand_kit?: Json | null
          brand_kit_status?: string | null
          brand_kit_updated_at?: string | null
          brand_name?: string | null
          confirmed?: boolean
          created_at?: string
          facebook_page_id?: string | null
          facebook_page_name?: string | null
          font_family?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          primary_color?: string | null
          product_categories?: string[] | null
          secondary_color?: string | null
          tagline?: string | null
          tone_of_voice?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_account_profiles_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_accounts: {
        Row: {
          account_id: string
          account_name: string
          connection_id: string
          created_at: string
          currency: string | null
          id: string
          timezone: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          account_name: string
          connection_id: string
          created_at?: string
          currency?: string | null
          id?: string
          timezone?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          account_name?: string
          connection_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          timezone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_accounts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "meta_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creatives: {
        Row: {
          ad_id: string
          created_at: string
          creative_type: string | null
          cta_type: string | null
          description: string | null
          destination_url: string | null
          headline: string | null
          id: string
          image_hash: string | null
          image_hashes: Json | null
          image_url: string | null
          meta_creative_id: string
          primary_text: string | null
          raw_asset_feed_spec: Json | null
          raw_data: Json | null
          raw_object_story_spec: Json | null
          stored_image_url: string | null
          stored_image_urls: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          creative_type?: string | null
          cta_type?: string | null
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          image_hash?: string | null
          image_hashes?: Json | null
          image_url?: string | null
          meta_creative_id: string
          primary_text?: string | null
          raw_asset_feed_spec?: Json | null
          raw_data?: Json | null
          raw_object_story_spec?: Json | null
          stored_image_url?: string | null
          stored_image_urls?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          creative_type?: string | null
          cta_type?: string | null
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          image_hash?: string | null
          image_hashes?: Json | null
          image_url?: string | null
          meta_creative_id?: string
          primary_text?: string | null
          raw_asset_feed_spec?: Json | null
          raw_data?: Json | null
          raw_object_story_spec?: Json | null
          stored_image_url?: string | null
          stored_image_urls?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_performance_daily: {
        Row: {
          ad_id: string
          clicks: number | null
          cost_per_purchase: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          ctr: number | null
          date: string
          frequency: number | null
          id: string
          impressions: number | null
          platform: string | null
          platform_position: string | null
          purchases: number | null
          reach: number | null
          result_type: string | null
          revenue: number | null
          roas: number | null
          spend: number | null
          unique_ctr: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_id: string
          clicks?: number | null
          cost_per_purchase?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          date: string
          frequency?: number | null
          id?: string
          impressions?: number | null
          platform?: string | null
          platform_position?: string | null
          purchases?: number | null
          reach?: number | null
          result_type?: string | null
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          unique_ctr?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          clicks?: number | null
          cost_per_purchase?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          frequency?: number | null
          id?: string
          impressions?: number | null
          platform?: string | null
          platform_position?: string | null
          purchases?: number | null
          reach?: number | null
          result_type?: string | null
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          unique_ctr?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_performance_daily_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_sets: {
        Row: {
          billing_event: string | null
          campaign_id: string
          created_at: string
          daily_budget: number | null
          effective_status: string | null
          end_time: string | null
          id: string
          lifetime_budget: number | null
          meta_adset_id: string
          name: string | null
          optimization_goal: string | null
          start_time: string | null
          status: string | null
          targeting: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_event?: string | null
          campaign_id: string
          created_at?: string
          daily_budget?: number | null
          effective_status?: string | null
          end_time?: string | null
          id?: string
          lifetime_budget?: number | null
          meta_adset_id: string
          name?: string | null
          optimization_goal?: string | null
          start_time?: string | null
          status?: string | null
          targeting?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_event?: string | null
          campaign_id?: string
          created_at?: string
          daily_budget?: number | null
          effective_status?: string | null
          end_time?: string | null
          id?: string
          lifetime_budget?: number | null
          meta_adset_id?: string
          name?: string | null
          optimization_goal?: string | null
          start_time?: string | null
          status?: string | null
          targeting?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_sets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_set_id: string
          created_at: string
          effective_status: string | null
          id: string
          media_type: string | null
          meta_ad_id: string
          meta_creative_id: string | null
          name: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_set_id: string
          created_at?: string
          effective_status?: string | null
          id?: string
          media_type?: string | null
          meta_ad_id: string
          meta_creative_id?: string | null
          name?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_set_id?: string
          created_at?: string
          effective_status?: string | null
          id?: string
          media_type?: string | null
          meta_ad_id?: string
          meta_creative_id?: string | null
          name?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          account_currency: string | null
          account_timezone: string | null
          category: string | null
          created_at: string
          id: number
          meta_account_id: string | null
          name: string | null
          target_languages: string | null
          target_regions: string | null
          user_id: string
        }
        Insert: {
          account_currency?: string | null
          account_timezone?: string | null
          category?: string | null
          created_at?: string
          id?: never
          meta_account_id?: string | null
          name?: string | null
          target_languages?: string | null
          target_regions?: string | null
          user_id: string
        }
        Update: {
          account_currency?: string | null
          account_timezone?: string | null
          category?: string | null
          created_at?: string
          id?: never
          meta_account_id?: string | null
          name?: string | null
          target_languages?: string | null
          target_regions?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          ad_account_id: string
          created_at: string
          daily_budget: number | null
          effective_status: string | null
          id: string
          lifetime_budget: number | null
          meta_campaign_id: string
          name: string | null
          objective: string | null
          start_time: string | null
          status: string | null
          stop_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_account_id: string
          created_at?: string
          daily_budget?: number | null
          effective_status?: string | null
          id?: string
          lifetime_budget?: number | null
          meta_campaign_id: string
          name?: string | null
          objective?: string | null
          start_time?: string | null
          status?: string | null
          stop_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_account_id?: string
          created_at?: string
          daily_budget?: number | null
          effective_status?: string | null
          id?: string
          lifetime_budget?: number | null
          meta_campaign_id?: string
          name?: string | null
          objective?: string | null
          start_time?: string | null
          status?: string | null
          stop_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      disclaimers: {
        Row: {
          ad_account_id: string
          created_at: string
          id: string
          label: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_account_id: string
          created_at?: string
          id?: string
          label: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_account_id?: string
          created_at?: string
          id?: string
          label?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disclaimers_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_creatives: {
        Row: {
          aspect_ratio: string | null
          created_at: string
          description: string | null
          feedback: string | null
          headline: string | null
          id: string
          image_url: string
          job_id: string
          metadata: Json
          primary_text: string | null
          thumbnail_url: string | null
          user_id: string
          variant_index: number
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string
          description?: string | null
          feedback?: string | null
          headline?: string | null
          id?: string
          image_url: string
          job_id: string
          metadata?: Json
          primary_text?: string | null
          thumbnail_url?: string | null
          user_id: string
          variant_index?: number
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string
          description?: string | null
          feedback?: string | null
          headline?: string | null
          id?: string
          image_url?: string
          job_id?: string
          metadata?: Json
          primary_text?: string | null
          thumbnail_url?: string | null
          user_id?: string
          variant_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "generated_creatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_jobs: {
        Row: {
          ad_account_id: string | null
          aspect_ratios: string[]
          created_at: string
          disclaimer_ids: string[] | null
          error_message: string | null
          goal: string | null
          icp_id: string | null
          icp_snapshot: Json | null
          id: string
          offer_type: string | null
          product_image_url: string | null
          product_input_method: string | null
          product_url: string | null
          promo_details: Json
          promo_scope: string | null
          service_request_payload: Json
          service_response_payload: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_account_id?: string | null
          aspect_ratios?: string[]
          created_at?: string
          disclaimer_ids?: string[] | null
          error_message?: string | null
          goal?: string | null
          icp_id?: string | null
          icp_snapshot?: Json | null
          id?: string
          offer_type?: string | null
          product_image_url?: string | null
          product_input_method?: string | null
          product_url?: string | null
          promo_details?: Json
          promo_scope?: string | null
          service_request_payload?: Json
          service_response_payload?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_account_id?: string | null
          aspect_ratios?: string[]
          created_at?: string
          disclaimer_ids?: string[] | null
          error_message?: string | null
          goal?: string | null
          icp_id?: string | null
          icp_snapshot?: Json | null
          id?: string
          offer_type?: string | null
          product_image_url?: string | null
          product_input_method?: string | null
          product_url?: string | null
          promo_details?: Json
          promo_scope?: string | null
          service_request_payload?: Json
          service_response_payload?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      icps: {
        Row: {
          ad_account_id: string
          created_at: string
          description: string
          id: string
          name: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_account_id: string
          created_at?: string
          description: string
          id?: string
          name: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_account_id?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "icps_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_connections: {
        Row: {
          access_token: string
          created_at: string
          id: string
          meta_user_id: string | null
          meta_user_name: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          meta_user_id?: string | null
          meta_user_name?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          meta_user_id?: string | null
          meta_user_name?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_ad_account_id: string | null
          email: string | null
          full_name: string | null
          id: string
          meta_user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_ad_account_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          meta_user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_ad_account_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          meta_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_ad_account_id_fkey"
            columns: ["default_ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_jobs: {
        Row: {
          ad_account_id: string
          created_at: string
          current_step: string | null
          cursor_date: string | null
          date_range_end: string | null
          date_range_start: string | null
          error_message: string | null
          id: string
          images_downloaded: number | null
          phase: string | null
          status: string
          supported_ads: number | null
          total_ads: number | null
          total_adsets: number | null
          total_campaigns: number | null
          total_creatives: number | null
          total_images: number | null
          unsupported_ads: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_account_id: string
          created_at?: string
          current_step?: string | null
          cursor_date?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          id?: string
          images_downloaded?: number | null
          phase?: string | null
          status?: string
          supported_ads?: number | null
          total_ads?: number | null
          total_adsets?: number | null
          total_campaigns?: number | null
          total_creatives?: number | null
          total_images?: number | null
          unsupported_ads?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_account_id?: string
          created_at?: string
          current_step?: string | null
          cursor_date?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          id?: string
          images_downloaded?: number | null
          phase?: string | null
          status?: string
          supported_ads?: number | null
          total_ads?: number | null
          total_adsets?: number | null
          total_campaigns?: number | null
          total_creatives?: number | null
          total_images?: number | null
          unsupported_ads?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_jobs_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      campaign_ad_data: {
        Row: {
          ad_effective_status: string | null
          ad_id: string | null
          ad_name: string | null
          ad_status: string | null
          adset_id: string | null
          adset_name: string | null
          adset_status: string | null
          brand_id: number | null
          campaign_id: string | null
          campaign_name: string | null
          campaign_objective: string | null
          campaign_status: string | null
          clicks: number | null
          cpc: number | null
          cpm: number | null
          creative_id: string | null
          creative_type: string | null
          cta_type: string | null
          ctr: number | null
          date: string | null
          description: string | null
          destination_url: string | null
          frequency: number | null
          headline: string | null
          image_url: string | null
          image_urls: Json | null
          impressions: number | null
          platform: string | null
          platform_position: string | null
          primary_text: string | null
          purchases: number | null
          reach: number | null
          revenue: number | null
          roas: number | null
          spend: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      owns_brand: { Args: { _brand_id: number }; Returns: boolean }
      refresh_campaign_ad_data: { Args: never; Returns: undefined }
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
