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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          store_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          store_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "platform_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          position: number
          slug: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          position?: number
          slug: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          slug?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          customer_id: string
          id: string
          is_primary: boolean
          label: string | null
          neighborhood: string | null
          number: string
          state: string
          store_id: string
          street: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_primary?: boolean
          label?: string | null
          neighborhood?: string | null
          number: string
          state: string
          store_id: string
          street: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_primary?: boolean
          label?: string | null
          neighborhood?: string | null
          number?: string
          state?: string
          store_id?: string
          street?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_addresses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string | null
          subtotal_cents: number | null
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot?: string | null
          subtotal_cents?: number | null
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          quantity?: number
          sku_snapshot?: string | null
          subtotal_cents?: number | null
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          actor_id: string | null
          created_at: string
          id: number
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: never
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: never
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "platform_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          delivery_address_snapshot: Json | null
          delivery_fee_cents: number
          fulfillment_type: Database["public"]["Enums"]["order_fulfillment_type"]
          id: string
          notes: string | null
          number_seq: number
          source: Database["public"]["Enums"]["order_source"]
          status: Database["public"]["Enums"]["order_status"]
          store_id: string
          subtotal_cents: number
          total_cents: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          delivery_address_snapshot?: Json | null
          delivery_fee_cents?: number
          fulfillment_type: Database["public"]["Enums"]["order_fulfillment_type"]
          id?: string
          notes?: string | null
          number_seq: number
          source?: Database["public"]["Enums"]["order_source"]
          status?: Database["public"]["Enums"]["order_status"]
          store_id: string
          subtotal_cents: number
          total_cents?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          delivery_address_snapshot?: Json | null
          delivery_fee_cents?: number
          fulfillment_type?: Database["public"]["Enums"]["order_fulfillment_type"]
          id?: string
          notes?: string | null
          number_seq?: number
          source?: Database["public"]["Enums"]["order_source"]
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string
          subtotal_cents?: number
          total_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_platform_admin: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_platform_admin?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_platform_admin?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          position: number
          product_id: string
          storage_path: string | null
          store_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          product_id: string
          storage_path?: string | null
          store_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          storage_path?: string | null
          store_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          name: string
          price_cents: number
          primary_image_url: string | null
          promo_price_cents: number | null
          sku: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock_qty: number | null
          store_id: string
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          name: string
          price_cents: number
          primary_image_url?: string | null
          promo_price_cents?: number | null
          sku?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_qty?: number | null
          store_id: string
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          price_cents?: number
          primary_image_url?: string | null
          promo_price_cents?: number | null
          sku?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_qty?: number | null
          store_id?: string
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_delivery_config: {
        Row: {
          delivery_fee_cents: number | null
          delivery_radius_km: number | null
          local_delivery_enabled: boolean
          pickup_enabled: boolean
          store_id: string
          updated_at: string
        }
        Insert: {
          delivery_fee_cents?: number | null
          delivery_radius_km?: number | null
          local_delivery_enabled?: boolean
          pickup_enabled?: boolean
          store_id: string
          updated_at?: string
        }
        Update: {
          delivery_fee_cents?: number | null
          delivery_radius_km?: number | null
          local_delivery_enabled?: boolean
          pickup_enabled?: boolean
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_delivery_config_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_members: {
        Row: {
          invited_at: string
          joined_at: string | null
          role: Database["public"]["Enums"]["store_member_role"]
          store_id: string
          user_id: string
        }
        Insert: {
          invited_at?: string
          joined_at?: string | null
          role: Database["public"]["Enums"]["store_member_role"]
          store_id: string
          user_id: string
        }
        Update: {
          invited_at?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["store_member_role"]
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_members_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "platform_users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_payment_gateways: {
        Row: {
          created_at: string
          id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          status: Database["public"]["Enums"]["payment_gateway_status"]
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider: Database["public"]["Enums"]["payment_provider"]
          status?: Database["public"]["Enums"]["payment_gateway_status"]
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          status?: Database["public"]["Enums"]["payment_gateway_status"]
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_payment_gateways_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip_code: string | null
          contact_email: string | null
          phone: string | null
          policy: string | null
          stock_enabled: boolean
          store_id: string
          theme_primary_color: string
          theme_secondary_color: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip_code?: string | null
          contact_email?: string | null
          phone?: string | null
          policy?: string | null
          stock_enabled?: boolean
          store_id: string
          theme_primary_color?: string
          theme_secondary_color?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip_code?: string | null
          contact_email?: string | null
          phone?: string | null
          policy?: string | null
          stock_enabled?: boolean
          store_id?: string
          theme_primary_color?: string
          theme_secondary_color?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          status: Database["public"]["Enums"]["store_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          status?: Database["public"]["Enums"]["store_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["store_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "platform_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_store: { Args: { p_store_id: string }; Returns: Json }
      create_order: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address: Json
          p_delivery_fee_cents: number
          p_fulfillment_type: Database["public"]["Enums"]["order_fulfillment_type"]
          p_items: Json
          p_notes: string
          p_store_id: string
        }
        Returns: string
      }
      create_store: {
        Args: { p_name: string; p_slug: string }
        Returns: string
      }
      is_platform_admin: { Args: never; Returns: boolean }
      mark_store_configuring: {
        Args: { p_store_id: string }
        Returns: undefined
      }
      record_audit: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_store_id?: string
        }
        Returns: number
      }
      reorder_categories: {
        Args: { p_ordered_ids: string[]; p_store_id: string }
        Returns: undefined
      }
      reorder_product_images: {
        Args: { p_ordered_ids: string[]; p_product_id: string }
        Returns: undefined
      }
      update_order_status: {
        Args: {
          p_next_status: Database["public"]["Enums"]["order_status"]
          p_note?: string
          p_order_id: string
        }
        Returns: undefined
      }
      upsert_store_payment_gateway: {
        Args: {
          p_provider: Database["public"]["Enums"]["payment_provider"]
          p_store_id: string
        }
        Returns: string
      }
      user_has_store_access: { Args: { p_store_id: string }; Returns: boolean }
      user_is_store_owner: { Args: { p_store_id: string }; Returns: boolean }
    }
    Enums: {
      order_fulfillment_type: "pickup" | "local_delivery"
      order_source: "manual" | "storefront"
      order_status:
        | "novo"
        | "aguardando_pagamento"
        | "pago"
        | "em_separacao"
        | "pronto_para_retirada"
        | "pronto_para_entrega"
        | "saiu_para_entrega"
        | "entregue"
        | "cancelado"
      payment_gateway_status: "pending_credentials" | "configured" | "disabled"
      payment_provider: "mercadopago" | "pagarme"
      product_status: "draft" | "active" | "inactive"
      store_member_role: "owner" | "admin" | "operator" | "financial"
      store_status: "draft" | "configuring" | "active" | "blocked"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_fulfillment_type: ["pickup", "local_delivery"],
      order_source: ["manual", "storefront"],
      order_status: [
        "novo",
        "aguardando_pagamento",
        "pago",
        "em_separacao",
        "pronto_para_retirada",
        "pronto_para_entrega",
        "saiu_para_entrega",
        "entregue",
        "cancelado",
      ],
      payment_gateway_status: ["pending_credentials", "configured", "disabled"],
      payment_provider: ["mercadopago", "pagarme"],
      product_status: ["draft", "active", "inactive"],
      store_member_role: ["owner", "admin", "operator", "financial"],
      store_status: ["draft", "configuring", "active", "blocked"],
    },
  },
} as const
