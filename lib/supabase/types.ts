export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          country: string | null
          address: string | null
          role: string
          balance: number
          business_name: string | null
          business_license: string | null
          profile_picture: string | null
          verification_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country?: string | null
          address?: string | null
          role?: string
          balance?: number
          business_name?: string | null
          business_license?: string | null
          profile_picture?: string | null
          verification_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country?: string | null
          address?: string | null
          role?: string
          balance?: number
          business_name?: string | null
          business_license?: string | null
          profile_picture?: string | null
          verification_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          currency: string
          status: string
          description: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          currency: string
          status?: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          currency?: string
          status?: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
      exchange_rates: {
        Row: {
          id: string
          from_currency: string
          to_currency: string
          rate: number
          updated_at: string
        }
        Insert: {
          id?: string
          from_currency: string
          to_currency: string
          rate: number
          updated_at?: string
        }
        Update: {
          id?: string
          from_currency?: string
          to_currency?: string
          rate?: number
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          location: string | null
          price: number | null
          currency: string
          image_url: string | null
          organizer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          location?: string | null
          price?: number | null
          currency?: string
          image_url?: string | null
          organizer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          location?: string | null
          price?: number | null
          currency?: string
          image_url?: string | null
          organizer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          user_id: string
          ticket_type: string | null
          price: number
          status: string
          qr_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          ticket_type?: string | null
          price: number
          status?: string
          qr_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          ticket_type?: string | null
          price?: number
          status?: string
          qr_code?: string | null
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          status: string
          reward_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          status?: string
          reward_amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          status?: string
          reward_amount?: number
          created_at?: string
        }
      }
    }
  }
}
