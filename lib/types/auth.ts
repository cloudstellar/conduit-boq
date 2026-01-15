// User role types
export type UserRole = 'admin' | 'dept_manager' | 'sector_manager' | 'staff' | 'procurement'

// User profile from database
export interface UserProfile {
  id: string
  employee_id: string | null
  title: string | null
  first_name: string
  last_name: string
  position: string | null
  org_id: string | null
  department_id: string | null
  sector_id: string | null
  role: UserRole
  email: string | null
  phone: string | null
  signature_url: string | null
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  created_at: string
  updated_at: string
}

// Extended user profile with relations
export interface UserProfileWithOrg extends UserProfile {
  organization?: {
    id: string
    name: string
    code: string
  } | null
  department?: {
    id: string
    code: string
    name: string
    full_name: string | null
  } | null
  sector?: {
    id: string
    code: string
    name: string
    full_name: string | null
  } | null
}

// Organization structure
export interface Organization {
  id: string
  name: string
  code: string
  is_active: boolean
  created_at: string
}

export interface Department {
  id: string
  org_id: string
  code: string
  name: string
  full_name: string | null
  is_active: boolean
  created_at: string
}

export interface Sector {
  id: string
  department_id: string
  code: string
  name: string
  full_name: string | null
  is_active: boolean
  created_at: string
}

// Auth context type
export interface AuthContextType {
  user: UserProfileWithOrg | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

