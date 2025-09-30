export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      shared_lists: {
        Row: {
          id: string
          name: string
          share_code: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          share_code: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          share_code?: string
          owner_id?: string
          created_at?: string
        }
      }
      shared_list_members: {
        Row: {
          id: string
          list_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          list_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          note: string
          is_completed: boolean
          priority: 'Urgent' | 'Important' | 'Normal'
          reminder: string | null
          category_id: string | null
          user_id: string | null
          shared_list_id: string | null
          completed_by: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          note?: string
          is_completed?: boolean
          priority?: 'Urgent' | 'Important' | 'Normal'
          reminder?: string | null
          category_id?: string | null
          user_id?: string | null
          shared_list_id?: string | null
          completed_by?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          note?: string
          is_completed?: boolean
          priority?: 'Urgent' | 'Important' | 'Normal'
          reminder?: string | null
          category_id?: string | null
          user_id?: string | null
          shared_list_id?: string | null
          completed_by?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}