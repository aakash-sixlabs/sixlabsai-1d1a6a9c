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
      account_users: {
        Row: {
          account_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_type: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          account_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ad_account_profiles: {
        Row: {
          accent_color: string | null
          account_id: string
          ad_account_id: string
          brand_id: string | null
          brand_kit: Json | null
          brand_kit_status:
            | Database["public"]["Enums"]["brand_kit_status"]
            | null
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
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          accent_color?: string | null
          account_id: string
          ad_account_id: string
          brand_id?: string | null
          brand_kit?: Json | null
          brand_kit_status?:
            | Database["public"]["Enums"]["brand_kit_status"]
            | null
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
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          accent_color?: string | null
          account_id?: string
          ad_account_id?: string
          brand_id?: string | null
          brand_kit?: Json | null
          brand_kit_status?:
            | Database["public"]["Enums"]["brand_kit_status"]
            | null
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
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_account_profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_account_profiles_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_account_profiles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_accounts: {
        Row: {
          account_id: string
          account_id_meta: string
          account_name: string
          connection_id: string
          connection_status: string
          created_at: string
          currency: string | null
          id: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          account_id_meta: string
          account_name: string
          connection_id: string
          connection_status?: string
          created_at?: string
          currency?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          account_id_meta?: string
          account_name?: string
          connection_id?: string
          connection_status?: string
          created_at?: string
          currency?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
          account_id: string
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
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
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
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
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
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
          account_id: string
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
          thumb_stop_rate: number | null
          unique_ctr: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
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
          thumb_stop_rate?: number | null
          unique_ctr?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
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
          thumb_stop_rate?: number | null
          unique_ctr?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_performance_daily_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
          account_id: string
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
          account_id: string
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
          account_id?: string
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
            foreignKeyName: "ad_sets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
          account_id: string
          ad_set_id: string
          created_at: string
          effective_status: string | null
          id: string
          media_type: string | null
          meta_ad_id: string
          meta_creative_id: string | null
          name: string | null
          parent_ad_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          ad_set_id: string
          created_at?: string
          effective_status?: string | null
          id?: string
          media_type?: string | null
          meta_ad_id: string
          meta_creative_id?: string | null
          name?: string | null
          parent_ad_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          ad_set_id?: string
          created_at?: string
          effective_status?: string | null
          id?: string
          media_type?: string | null
          meta_ad_id?: string
          meta_creative_id?: string | null
          name?: string | null
          parent_ad_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_parent_ad_id_fkey"
            columns: ["parent_ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_archetypes: {
        Row: {
          account_id: string
          ad_type: string | null
          archetype_id: string
          brand_id: string
          created_at: string
          id: string
          is_permitted: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          ad_type?: string | null
          archetype_id: string
          brand_id: string
          created_at?: string
          id?: string
          is_permitted?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          ad_type?: string | null
          archetype_id?: string
          brand_id?: string
          created_at?: string
          id?: string
          is_permitted?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_archetypes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_archetypes_archetype_id_fkey"
            columns: ["archetype_id"]
            isOneToOne: false
            referencedRelation: "scene_archetypes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_archetypes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_competitors: {
        Row: {
          account_id: string
          brand_id: string
          competitor_meta_page_id: string | null
          competitor_meta_page_name: string | null
          competitor_name: string | null
          created_at: string
          foreplay_brand_id: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          brand_id: string
          competitor_meta_page_id?: string | null
          competitor_meta_page_name?: string | null
          competitor_name?: string | null
          created_at?: string
          foreplay_brand_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          brand_id?: string
          competitor_meta_page_id?: string | null
          competitor_meta_page_name?: string | null
          competitor_name?: string | null
          created_at?: string
          foreplay_brand_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_competitors_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
          account_id: string
          ad_account_id: string | null
          category: string | null
          created_at: string
          id: string
          name: string
          target_languages: string | null
          target_regions: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          ad_account_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          name: string
          target_languages?: string | null
          target_regions?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          ad_account_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          target_languages?: string | null
          target_regions?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          account_id: string
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
          account_id: string
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
          account_id?: string
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
            foreignKeyName: "campaigns_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
          account_id: string
          brand_competitor_id: string | null
          brand_id: string
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
          id: string
          image_url: string | null
          is_active: boolean | null
          last_seen_date: string | null
          meta_ad_id: string | null
          niches: string | null
          platform: string | null
          product_category: string | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          account_id: string
          brand_competitor_id?: string | null
          brand_id: string
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
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_seen_date?: string | null
          meta_ad_id?: string | null
          niches?: string | null
          platform?: string | null
          product_category?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          account_id?: string
          brand_competitor_id?: string | null
          brand_id?: string
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
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_seen_date?: string | null
          meta_ad_id?: string | null
          niches?: string | null
          platform?: string | null
          product_category?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_ads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_ads_brand_competitor_id_fkey"
            columns: ["brand_competitor_id"]
            isOneToOne: false
            referencedRelation: "brand_competitors"
            referencedColumns: ["id"]
          },
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
          account_id: string
          confidence: number | null
          created_at: string
          creative_id: string
          creative_source: Database["public"]["Enums"]["creative_source"]
          id: string
          is_ai_generated: boolean
          is_verified: boolean
          tag_category: string
          tag_value: string
          user_id: string
        }
        Insert: {
          account_id: string
          confidence?: number | null
          created_at?: string
          creative_id: string
          creative_source: Database["public"]["Enums"]["creative_source"]
          id?: string
          is_ai_generated?: boolean
          is_verified?: boolean
          tag_category: string
          tag_value: string
          user_id: string
        }
        Update: {
          account_id?: string
          confidence?: number | null
          created_at?: string
          creative_id?: string
          creative_source?: Database["public"]["Enums"]["creative_source"]
          id?: string
          is_ai_generated?: boolean
          is_verified?: boolean
          tag_category?: string
          tag_value?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_tags_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      disclaimers: {
        Row: {
          account_id: string
          ad_account_id: string
          brand_id: string | null
          created_at: string
          id: string
          label: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          ad_account_id: string
          brand_id?: string | null
          created_at?: string
          id?: string
          label: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          ad_account_id?: string
          brand_id?: string | null
          created_at?: string
          id?: string
          label?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disclaimers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disclaimers_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disclaimers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      fatigue_diagnoses: {
        Row: {
          account_id: string
          ad_id: string
          adset_id: string | null
          brand_id: string
          component: Database["public"]["Enums"]["fatigue_component"]
          created_at: string
          ctr_7d_slope: number | null
          ctr_drop_pct: number | null
          current_visual_tags: string | null
          diagnosed_at: string
          dismissed_at: string | null
          dismissed_by: string | null
          est_daily_waste: number | null
          frequency_value: number | null
          id: string
          notes: string | null
          preserve_tags: string | null
          replace_tags: string | null
          roas_7d_slope: number | null
          roas_drop_pct: number | null
          severity: Database["public"]["Enums"]["fatigue_severity"]
          status: Database["public"]["Enums"]["fatigue_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          ad_id: string
          adset_id?: string | null
          brand_id: string
          component: Database["public"]["Enums"]["fatigue_component"]
          created_at?: string
          ctr_7d_slope?: number | null
          ctr_drop_pct?: number | null
          current_visual_tags?: string | null
          diagnosed_at?: string
          dismissed_at?: string | null
          dismissed_by?: string | null
          est_daily_waste?: number | null
          frequency_value?: number | null
          id?: string
          notes?: string | null
          preserve_tags?: string | null
          replace_tags?: string | null
          roas_7d_slope?: number | null
          roas_drop_pct?: number | null
          severity: Database["public"]["Enums"]["fatigue_severity"]
          status?: Database["public"]["Enums"]["fatigue_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          ad_id?: string
          adset_id?: string | null
          brand_id?: string
          component?: Database["public"]["Enums"]["fatigue_component"]
          created_at?: string
          ctr_7d_slope?: number | null
          ctr_drop_pct?: number | null
          current_visual_tags?: string | null
          diagnosed_at?: string
          dismissed_at?: string | null
          dismissed_by?: string | null
          est_daily_waste?: number | null
          frequency_value?: number | null
          id?: string
          notes?: string | null
          preserve_tags?: string | null
          replace_tags?: string | null
          roas_7d_slope?: number | null
          roas_drop_pct?: number | null
          severity?: Database["public"]["Enums"]["fatigue_severity"]
          status?: Database["public"]["Enums"]["fatigue_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fatigue_diagnoses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fatigue_diagnoses_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fatigue_diagnoses_adset_id_fkey"
            columns: ["adset_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
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
      generated_creatives: {
        Row: {
          account_id: string
          approved_at: string | null
          approved_by: string | null
          aspect_ratio: string | null
          brand_id: string | null
          created_at: string
          description: string | null
          fatigue_diagnosis_id: string | null
          feedback: string | null
          headline: string | null
          id: string
          image_url: string
          job_id: string
          metadata: Json
          parent_ad_id: string | null
          primary_text: string | null
          prompt_template_id: string | null
          published_at: string | null
          published_by: string | null
          published_meta_ad_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["creative_status"]
          storage_status: string | null
          stored_image_url: string | null
          stored_thumbnail_url: string | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          variant_index: number
        }
        Insert: {
          account_id: string
          approved_at?: string | null
          approved_by?: string | null
          aspect_ratio?: string | null
          brand_id?: string | null
          created_at?: string
          description?: string | null
          fatigue_diagnosis_id?: string | null
          feedback?: string | null
          headline?: string | null
          id?: string
          image_url: string
          job_id: string
          metadata?: Json
          parent_ad_id?: string | null
          primary_text?: string | null
          prompt_template_id?: string | null
          published_at?: string | null
          published_by?: string | null
          published_meta_ad_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["creative_status"]
          storage_status?: string | null
          stored_image_url?: string | null
          stored_thumbnail_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          variant_index?: number
        }
        Update: {
          account_id?: string
          approved_at?: string | null
          approved_by?: string | null
          aspect_ratio?: string | null
          brand_id?: string | null
          created_at?: string
          description?: string | null
          fatigue_diagnosis_id?: string | null
          feedback?: string | null
          headline?: string | null
          id?: string
          image_url?: string
          job_id?: string
          metadata?: Json
          parent_ad_id?: string | null
          primary_text?: string | null
          prompt_template_id?: string | null
          published_at?: string | null
          published_by?: string | null
          published_meta_ad_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["creative_status"]
          storage_status?: string | null
          stored_image_url?: string | null
          stored_thumbnail_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          variant_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "generated_creatives_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_creatives_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_creatives_fatigue_diagnosis_id_fkey"
            columns: ["fatigue_diagnosis_id"]
            isOneToOne: false
            referencedRelation: "fatigue_diagnoses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_creatives_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "generation_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_creatives_parent_ad_id_fkey"
            columns: ["parent_ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_creatives_prompt_template_id_fkey"
            columns: ["prompt_template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_jobs: {
        Row: {
          account_id: string
          ad_account_id: string | null
          aspect_ratios: string[]
          attempt_count: number | null
          brand_id: string | null
          callback_received_at: string | null
          created_at: string
          credits_used: number | null
          disclaimer_ids: string[] | null
          error_message: string | null
          fatigue_diagnosis_id: string | null
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
          service_job_id: string | null
          service_request_payload: Json
          service_response_payload: Json | null
          source_ad_id: string | null
          status: Database["public"]["Enums"]["generation_status"]
          trigger_type: Database["public"]["Enums"]["generation_trigger_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          ad_account_id?: string | null
          aspect_ratios?: string[]
          attempt_count?: number | null
          brand_id?: string | null
          callback_received_at?: string | null
          created_at?: string
          credits_used?: number | null
          disclaimer_ids?: string[] | null
          error_message?: string | null
          fatigue_diagnosis_id?: string | null
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
          service_job_id?: string | null
          service_request_payload?: Json
          service_response_payload?: Json | null
          source_ad_id?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
          trigger_type?: Database["public"]["Enums"]["generation_trigger_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          ad_account_id?: string | null
          aspect_ratios?: string[]
          attempt_count?: number | null
          brand_id?: string | null
          callback_received_at?: string | null
          created_at?: string
          credits_used?: number | null
          disclaimer_ids?: string[] | null
          error_message?: string | null
          fatigue_diagnosis_id?: string | null
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
          service_job_id?: string | null
          service_request_payload?: Json
          service_response_payload?: Json | null
          source_ad_id?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
          trigger_type?: Database["public"]["Enums"]["generation_trigger_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_jobs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_fatigue_diagnosis_id_fkey"
            columns: ["fatigue_diagnosis_id"]
            isOneToOne: false
            referencedRelation: "fatigue_diagnoses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_icp_id_fkey"
            columns: ["icp_id"]
            isOneToOne: false
            referencedRelation: "icps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_source_ad_id_fkey"
            columns: ["source_ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      icps: {
        Row: {
          account_id: string
          ad_account_id: string
          brand_id: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          ad_account_id: string
          brand_id?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          name: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          ad_account_id?: string
          brand_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "icps_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "icps_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "icps_brand_id_fkey"
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
          account_id: string
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
          account_id: string
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
          account_id?: string
          created_at?: string
          id?: string
          meta_user_id?: string | null
          meta_user_name?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_connections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          account_id: string
          brand_id: string
          created_at: string
          description: string | null
          handle: string | null
          id: string
          image_urls: Json | null
          shopify_id: number | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          brand_id: string
          created_at?: string
          description?: string | null
          handle?: string | null
          id?: string
          image_urls?: Json | null
          shopify_id?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          brand_id?: string
          created_at?: string
          description?: string | null
          handle?: string | null
          id?: string
          image_urls?: Json | null
          shopify_id?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
          is_superadmin: boolean
          meta_user_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_ad_account_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_superadmin?: boolean
          meta_user_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_ad_account_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_superadmin?: boolean
          meta_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_ad_account_fk"
            columns: ["default_ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_template_performance: {
        Row: {
          created_at: string
          ctr_7d: number | null
          ctr_vs_parent: number | null
          generated_creative_id: string
          id: string
          is_winner: boolean | null
          prompt_template_id: string
          purchases_7d: number | null
          roas_7d: number | null
          roas_vs_parent: number | null
          spend_7d: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ctr_7d?: number | null
          ctr_vs_parent?: number | null
          generated_creative_id: string
          id?: string
          is_winner?: boolean | null
          prompt_template_id: string
          purchases_7d?: number | null
          roas_7d?: number | null
          roas_vs_parent?: number | null
          spend_7d?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ctr_7d?: number | null
          ctr_vs_parent?: number | null
          generated_creative_id?: string
          id?: string
          is_winner?: boolean | null
          prompt_template_id?: string
          purchases_7d?: number | null
          roas_7d?: number | null
          roas_vs_parent?: number | null
          spend_7d?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_template_performance_generated_creative_id_fkey"
            columns: ["generated_creative_id"]
            isOneToOne: false
            referencedRelation: "generated_creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_template_performance_prompt_template_id_fkey"
            columns: ["prompt_template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          is_active: boolean
          model: string | null
          name: string
          notes: string | null
          parameters: Json | null
          template_text: string
          updated_at: string
          use_case: string | null
          user_id: string
          version: number
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          model?: string | null
          name: string
          notes?: string | null
          parameters?: Json | null
          template_text: string
          updated_at?: string
          use_case?: string | null
          user_id: string
          version?: number
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          model?: string | null
          name?: string
          notes?: string | null
          parameters?: Json | null
          template_text?: string
          updated_at?: string
          use_case?: string | null
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_templates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      scene_archetypes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sync_jobs: {
        Row: {
          account_id: string
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
          status: Database["public"]["Enums"]["sync_status"]
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
          account_id: string
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
          status?: Database["public"]["Enums"]["sync_status"]
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
          account_id?: string
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
          status?: Database["public"]["Enums"]["sync_status"]
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
            foreignKeyName: "sync_jobs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
      has_account_access: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      is_account_admin: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      user_account_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      brand_kit_status: "pending" | "processing" | "completed" | "failed"
      creative_source: "own_ad" | "competitor_ad" | "generated"
      creative_status:
        | "draft"
        | "approved"
        | "published"
        | "rejected"
        | "archived"
      fatigue_component: "creative_visual" | "copy" | "audience" | "offer"
      fatigue_severity: "low" | "medium" | "high"
      fatigue_status: "pending" | "generating" | "generated" | "dismissed"
      generation_status: "pending" | "processing" | "completed" | "failed"
      generation_trigger_type: "manual" | "automated"
      sync_status: "pending" | "running" | "completed" | "failed"
      user_role: "superadmin" | "account_admin" | "account_member"
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
      brand_kit_status: ["pending", "processing", "completed", "failed"],
      creative_source: ["own_ad", "competitor_ad", "generated"],
      creative_status: [
        "draft",
        "approved",
        "published",
        "rejected",
        "archived",
      ],
      fatigue_component: ["creative_visual", "copy", "audience", "offer"],
      fatigue_severity: ["low", "medium", "high"],
      fatigue_status: ["pending", "generating", "generated", "dismissed"],
      generation_status: ["pending", "processing", "completed", "failed"],
      generation_trigger_type: ["manual", "automated"],
      sync_status: ["pending", "running", "completed", "failed"],
      user_role: ["superadmin", "account_admin", "account_member"],
    },
  },
} as const
