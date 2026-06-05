export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = "admin" | "hr" | "manager" | "employee"
export type EmployeeStatus = "active" | "inactive" | "on_leave"
export type AttendanceStatus =
  | "present"
  | "late"
  | "half_day"
  | "absent"
  | "remote"
  | "on_leave"
export type WorkMode = "office" | "remote" | "hybrid"
export type AnnouncementPriority = "low" | "normal" | "high" | "urgent"
export type TargetAudience = "all" | "department" | "role" | "specific_users"
export type NewsCategory =
  | "general"
  | "event"
  | "policy"
  | "achievement"
  | "holiday"
export type LeaveType = "sick" | "casual" | "annual" | "unpaid"
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          department_id: string | null
          manager_id: string | null
          employee_id: string | null
          phone: string | null
          designation: string | null
          join_date: string | null
          status: EmployeeStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          department_id?: string | null
          manager_id?: string | null
          employee_id?: string | null
          phone?: string | null
          designation?: string | null
          join_date?: string | null
          status?: EmployeeStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          department_id?: string | null
          manager_id?: string | null
          employee_id?: string | null
          phone?: string | null
          designation?: string | null
          join_date?: string | null
          status?: EmployeeStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          head_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          head_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          head_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          id: string
          user_id: string
          check_in: string | null
          check_out: string | null
          date: string
          status: AttendanceStatus
          work_mode: WorkMode
          notes: string | null
          ip_address: string | null
          location: Json | null
          total_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          check_in?: string | null
          check_out?: string | null
          date: string
          status?: AttendanceStatus
          work_mode?: WorkMode
          notes?: string | null
          ip_address?: string | null
          location?: Json | null
          total_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          check_in?: string | null
          check_out?: string | null
          date?: string
          status?: AttendanceStatus
          work_mode?: WorkMode
          notes?: string | null
          ip_address?: string | null
          location?: Json | null
          total_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          priority: AnnouncementPriority
          target_audience: TargetAudience
          target_department_id: string | null
          target_role: UserRole | null
          published_by: string
          is_pinned: boolean
          is_published: boolean
          publish_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          priority?: AnnouncementPriority
          target_audience?: TargetAudience
          target_department_id?: string | null
          target_role?: UserRole | null
          published_by: string
          is_pinned?: boolean
          is_published?: boolean
          publish_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          priority?: AnnouncementPriority
          target_audience?: TargetAudience
          target_department_id?: string | null
          target_role?: UserRole | null
          published_by?: string
          is_pinned?: boolean
          is_published?: boolean
          publish_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          announcement_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          announcement_id?: string
          user_id?: string
          read_at?: string
        }
        Relationships: []
      }
      office_news: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          category: NewsCategory
          cover_image_url: string | null
          author_id: string
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          category?: NewsCategory
          cover_image_url?: string | null
          author_id: string
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          category?: NewsCategory
          cover_image_url?: string | null
          author_id?: string
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          id: string
          user_id: string
          leave_type: LeaveType
          start_date: string
          end_date: string
          reason: string
          status: LeaveStatus
          approved_by: string | null
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          leave_type: LeaveType
          start_date: string
          end_date: string
          reason: string
          status?: LeaveStatus
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          leave_type?: LeaveType
          start_date?: string
          end_date?: string
          reason?: string
          status?: LeaveStatus
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      office_settings: {
        Row: {
          key: string
          value: Json
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Department = Database["public"]["Tables"]["departments"]["Row"]
export type Attendance = Database["public"]["Tables"]["attendance"]["Row"]
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"]
export type AnnouncementRead = Database["public"]["Tables"]["announcement_reads"]["Row"]
export type OfficeNews = Database["public"]["Tables"]["office_news"]["Row"]
export type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"]
export type OfficeSetting = Database["public"]["Tables"]["office_settings"]["Row"]
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"]

export type ProfileWithDepartment = Profile & {
  department?: Department | null
  manager?: Pick<Profile, "id" | "full_name" | "email"> | null
}

export type AttendanceWithProfile = Attendance & {
  profile?: Pick<Profile, "id" | "full_name" | "email" | "employee_id">
}

export type AnnouncementWithAuthor = Announcement & {
  author?: Pick<Profile, "id" | "full_name">
  is_read?: boolean
}

export type LeaveRequestWithProfile = LeaveRequest & {
  profile?: Pick<Profile, "id" | "full_name" | "email" | "employee_id"> | null
  approver?: Pick<Profile, "id" | "full_name"> | null
}
