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
          ad_account_id: string
          confirmed: boolean
          created_at: string
          facebook_page_id: string | null
          facebook_page_name: string | null
          id: string
          industry: string | null
          user_id: string
        }
        Insert: {
          ad_account_id: string
          confirmed?: boolean
          created_at?: string
          facebook_page_id?: string | null
          facebook_page_name?: string | null
          id?: string
          industry?: string | null
          user_id: string
        }
        Update: {
          ad_account_id?: string
          confirmed?: boolean
          created_at?: string
          facebook_page_id?: string | null
          facebook_page_name?: string | null
          id?: string
          industry?: string | null
          user_id?: string
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
          call_to_action: string | null
          created_at: string
          creative_id: string
          creative_type: string
          description: string | null
          destination_url: string | null
          headline: string | null
          id: string
          image_urls: Json | null
          primary_text: string | null
          raw_data: Json | null
          user_id: string
        }
        Insert: {
          ad_id: string
          call_to_action?: string | null
          created_at?: string
          creative_id: string
          creative_type?: string
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          image_urls?: Json | null
          primary_text?: string | null
          raw_data?: Json | null
          user_id: string
        }
        Update: {
          ad_id?: string
          call_to_action?: string | null
          created_at?: string
          creative_id?: string
          creative_type?: string
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          image_urls?: Json | null
          primary_text?: string | null
          raw_data?: Json | null
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
      ad_insights: {
        Row: {
          ad_id: string
          clicks: number | null
          conversion_value: number | null
          conversions: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          ctr: number | null
          date_start: string
          date_stop: string
          id: string
          impressions: number | null
          roas: number | null
          spend: number | null
          user_id: string
        }
        Insert: {
          ad_id: string
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          date_start: string
          date_stop: string
          id?: string
          impressions?: number | null
          roas?: number | null
          spend?: number | null
          user_id: string
        }
        Update: {
          ad_id?: string
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          date_start?: string
          date_stop?: string
          id?: string
          impressions?: number | null
          roas?: number | null
          spend?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_insights_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: true
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_performance_daily: {
        Row: {
          ad_id: number | null
          clicks: number | null
          created_at: string
          creative_id: number | null
          ctr: number | null
          date: string | null
          frequency: number | null
          id: number
          impressions: number | null
          platform: string | null
          platform_position: string | null
          roas: number | null
          spend: number | null
        }
        Insert: {
          ad_id?: number | null
          clicks?: number | null
          created_at?: string
          creative_id?: number | null
          ctr?: number | null
          date?: string | null
          frequency?: number | null
          id?: never
          impressions?: number | null
          platform?: string | null
          platform_position?: string | null
          roas?: number | null
          spend?: number | null
        }
        Update: {
          ad_id?: number | null
          clicks?: number | null
          created_at?: string
          creative_id?: number | null
          ctr?: number | null
          date?: string | null
          frequency?: number | null
          id?: never
          impressions?: number | null
          platform?: string | null
          platform_position?: string | null
          roas?: number | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_performance_daily_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "prod_ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_sets: {
        Row: {
          adset_id: string
          adset_name: string
          campaign_id: string
          created_at: string
          id: string
          status: string | null
          targeting: Json | null
          user_id: string
        }
        Insert: {
          adset_id: string
          adset_name: string
          campaign_id: string
          created_at?: string
          id?: string
          status?: string | null
          targeting?: Json | null
          user_id: string
        }
        Update: {
          adset_id?: string
          adset_name?: string
          campaign_id?: string
          created_at?: string
          id?: string
          status?: string | null
          targeting?: Json | null
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
          ad_id: string
          ad_name: string
          adset_id: string
          created_at: string
          creative_id: string | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          ad_id: string
          ad_name: string
          adset_id: string
          created_at?: string
          creative_id?: string | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          ad_id?: string
          ad_name?: string
          adset_id?: string
          created_at?: string
          creative_id?: string | null
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_adset_id_fkey"
            columns: ["adset_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_competitors: {
        Row: {
          brand_id: number | null
          competitor_meta_page_id: string | null
          competitor_meta_page_name: string | null
          competitor_name: string | null
          created_at: string
          foreplay_brand_id: string | null
          id: number
        }
        Insert: {
          brand_id?: number | null
          competitor_meta_page_id?: string | null
          competitor_meta_page_name?: string | null
          competitor_name?: string | null
          created_at?: string
          foreplay_brand_id?: string | null
          id?: never
        }
        Update: {
          brand_id?: number | null
          competitor_meta_page_id?: string | null
          competitor_meta_page_name?: string | null
          competitor_name?: string | null
          created_at?: string
          foreplay_brand_id?: string | null
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "brand_competitors_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
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
      campaign_ad_data: {
        Row: {
          ad_id: string | null
          ad_name: string | null
          ad_status: string | null
          adset_id: string | null
          adset_name: string | null
          adset_status: string | null
          brand_id: number | null
          call_to_action: string | null
          campaign_id: string | null
          campaign_name: string | null
          campaign_status: string | null
          clicks: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          creative_body: string | null
          creative_id: string | null
          creative_image_url: string | null
          creative_thumbnail_url: string | null
          creative_title: string | null
          ctr: number | null
          date: string | null
          fatigue_severity: string | null
          frequency: number | null
          id: number
          impressions: number | null
          is_fatigued: boolean | null
          platform: string | null
          platform_position: string | null
          purchases: number | null
          reach: number | null
          roas: number | null
          spend: number | null
          target_countries: string | null
          target_languages: string | null
        }
        Insert: {
          ad_id?: string | null
          ad_name?: string | null
          ad_status?: string | null
          adset_id?: string | null
          adset_name?: string | null
          adset_status?: string | null
          brand_id?: number | null
          call_to_action?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          campaign_status?: string | null
          clicks?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          creative_body?: string | null
          creative_id?: string | null
          creative_image_url?: string | null
          creative_thumbnail_url?: string | null
          creative_title?: string | null
          ctr?: number | null
          date?: string | null
          fatigue_severity?: string | null
          frequency?: number | null
          id?: never
          impressions?: number | null
          is_fatigued?: boolean | null
          platform?: string | null
          platform_position?: string | null
          purchases?: number | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
          target_countries?: string | null
          target_languages?: string | null
        }
        Update: {
          ad_id?: string | null
          ad_name?: string | null
          ad_status?: string | null
          adset_id?: string | null
          adset_name?: string | null
          adset_status?: string | null
          brand_id?: number | null
          call_to_action?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          campaign_status?: string | null
          clicks?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          creative_body?: string | null
          creative_id?: string | null
          creative_image_url?: string | null
          creative_thumbnail_url?: string | null
          creative_title?: string | null
          ctr?: number | null
          date?: string | null
          fatigue_severity?: string | null
          frequency?: number | null
          id?: never
          impressions?: number | null
          is_fatigued?: boolean | null
          platform?: string | null
          platform_position?: string | null
          purchases?: number | null
          reach?: number | null
          roas?: number | null
          spend?: number | null
          target_countries?: string | null
          target_languages?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_ad_data_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ad_account_id: string
          campaign_id: string
          campaign_name: string
          created_at: string
          id: string
          objective: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          ad_account_id: string
          campaign_id: string
          campaign_name: string
          created_at?: string
          id?: string
          objective?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          ad_account_id?: string
          campaign_id?: string
          campaign_name?: string
          created_at?: string
          id?: string
          objective?: string | null
          status?: string | null
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
      competitor_ads: {
        Row: {
          brand_id: number | null
          competitor_brand_name: string | null
          copy_body: string | null
          copy_headline: string | null
          created_at: string
          cta_title: string | null
          cta_type: string | null
          days_running: number | null
          display_format: string | null
          emotional_drivers: string | null
          est_monthly_spend: number | null
          first_seen_date: string | null
          foreplay_ad_id: string | null
          foreplay_brand_id: string | null
          full_transcription: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          last_seen_date: string | null
          link_url: string | null
          meta_ad_id: string | null
          niches: string | null
          platform: string | null
          product_category: string | null
          source: string | null
          thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          brand_id?: number | null
          competitor_brand_name?: string | null
          copy_body?: string | null
          copy_headline?: string | null
          created_at?: string
          cta_title?: string | null
          cta_type?: string | null
          days_running?: number | null
          display_format?: string | null
          emotional_drivers?: string | null
          est_monthly_spend?: number | null
          first_seen_date?: string | null
          foreplay_ad_id?: string | null
          foreplay_brand_id?: string | null
          full_transcription?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          last_seen_date?: string | null
          link_url?: string | null
          meta_ad_id?: string | null
          niches?: string | null
          platform?: string | null
          product_category?: string | null
          source?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          brand_id?: number | null
          competitor_brand_name?: string | null
          copy_body?: string | null
          copy_headline?: string | null
          created_at?: string
          cta_title?: string | null
          cta_type?: string | null
          days_running?: number | null
          display_format?: string | null
          emotional_drivers?: string | null
          est_monthly_spend?: number | null
          first_seen_date?: string | null
          foreplay_ad_id?: string | null
          foreplay_brand_id?: string | null
          full_transcription?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          last_seen_date?: string | null
          link_url?: string | null
          meta_ad_id?: string | null
          niches?: string | null
          platform?: string | null
          product_category?: string | null
          source?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_ads_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_tags: {
        Row: {
          ad_id: number | null
          brand_id: number | null
          created_at: string
          id: number
          tags: string | null
        }
        Insert: {
          ad_id?: number | null
          brand_id?: number | null
          created_at?: string
          id?: never
          tags?: string | null
        }
        Update: {
          ad_id?: number | null
          brand_id?: number | null
          created_at?: string
          id?: never
          tags?: string | null
        }
        Relationships: []
      }
      creatives: {
        Row: {
          brand_id: number | null
          copy_body: string | null
          copy_cta: string | null
          copy_headline: string | null
          created_at: string
          id: number
          image_url: string | null
          parent_creative_id: number | null
          platform: string | null
          source: string | null
        }
        Insert: {
          brand_id?: number | null
          copy_body?: string | null
          copy_cta?: string | null
          copy_headline?: string | null
          created_at?: string
          id?: never
          image_url?: string | null
          parent_creative_id?: number | null
          platform?: string | null
          source?: string | null
        }
        Update: {
          brand_id?: number | null
          copy_body?: string | null
          copy_cta?: string | null
          copy_headline?: string | null
          created_at?: string
          id?: never
          image_url?: string | null
          parent_creative_id?: number | null
          platform?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creatives_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      fatigue_diagnoses: {
        Row: {
          ad_id: number | null
          adset_id: string | null
          brand_id: number | null
          creative_id: number | null
          ctr_trend_7d: number | null
          current_visual_tags: string | null
          detected_at: string
          est_daily_waste: number | null
          fatigued_component: string | null
          id: number
          is_actioned: boolean | null
          platform: string | null
          preserve_tags: string | null
          replace_tags: string | null
          severity: string | null
        }
        Insert: {
          ad_id?: number | null
          adset_id?: string | null
          brand_id?: number | null
          creative_id?: number | null
          ctr_trend_7d?: number | null
          current_visual_tags?: string | null
          detected_at?: string
          est_daily_waste?: number | null
          fatigued_component?: string | null
          id?: never
          is_actioned?: boolean | null
          platform?: string | null
          preserve_tags?: string | null
          replace_tags?: string | null
          severity?: string | null
        }
        Update: {
          ad_id?: number | null
          adset_id?: string | null
          brand_id?: number | null
          creative_id?: number | null
          ctr_trend_7d?: number | null
          current_visual_tags?: string | null
          detected_at?: string
          est_daily_waste?: number | null
          fatigued_component?: string | null
          id?: never
          is_actioned?: boolean | null
          platform?: string | null
          preserve_tags?: string | null
          replace_tags?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fatigue_diagnoses_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "prod_ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fatigue_diagnoses_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
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
      prod_ads: {
        Row: {
          adset_id: string | null
          brand_id: number | null
          created_at: string
          creative_id: number | null
          creative_url: string | null
          id: number
          meta_ad_id: string | null
          name: string | null
          parent_ad_id: number | null
          status: string | null
        }
        Insert: {
          adset_id?: string | null
          brand_id?: number | null
          created_at?: string
          creative_id?: number | null
          creative_url?: string | null
          id?: never
          meta_ad_id?: string | null
          name?: string | null
          parent_ad_id?: number | null
          status?: string | null
        }
        Update: {
          adset_id?: string | null
          brand_id?: number | null
          created_at?: string
          creative_id?: number | null
          creative_url?: string | null
          id?: never
          meta_ad_id?: string | null
          name?: string | null
          parent_ad_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prod_ads_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: number | null
          created_at: string
          description: string | null
          handle: string | null
          id: number
          image_urls: string | null
          shopify_id: number | null
          title: string | null
        }
        Insert: {
          brand_id?: number | null
          created_at?: string
          description?: string | null
          handle?: string | null
          id?: never
          image_urls?: string | null
          shopify_id?: number | null
          title?: string | null
        }
        Update: {
          brand_id?: number | null
          created_at?: string
          description?: string | null
          handle?: string | null
          id?: never
          image_urls?: string | null
          shopify_id?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
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
          date_range_end: string | null
          date_range_start: string | null
          error_message: string | null
          id: string
          status: string
          supported_ads: number | null
          total_ads: number | null
          unsupported_ads: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_account_id: string
          created_at?: string
          current_step?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          id?: string
          status?: string
          supported_ads?: number | null
          total_ads?: number | null
          unsupported_ads?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_account_id?: string
          created_at?: string
          current_step?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          error_message?: string | null
          id?: string
          status?: string
          supported_ads?: number | null
          total_ads?: number | null
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
      [_ in never]: never
    }
    Functions: {
      owns_brand: { Args: { _brand_id: number }; Returns: boolean }
      owns_creative: { Args: { _creative_id: number }; Returns: boolean }
      owns_prod_ad: { Args: { _ad_id: number }; Returns: boolean }
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
