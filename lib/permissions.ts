import { UserRole, UserProfileWithOrg } from '@/lib/types/auth'

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'assign_committee'
export type Resource = 'boq' | 'user' | 'price_list' | 'committee' | 'profile'

export interface BOQContext {
  created_by?: string | null
  assigned_to?: string | null
  sector_id?: string | null
  department_id?: string | null
  status?: string
}

/**
 * Check if user can perform action on resource
 * This is the client-side permission check for UI display
 * Server-side RLS policies provide the actual security
 */
export function can(
  user: UserProfileWithOrg | null,
  action: Action,
  resource: Resource,
  context?: BOQContext
): boolean {
  if (!user) return false

  // Inactive/Suspended users cannot do anything except view/update own profile
  if (user.status === 'inactive' || user.status === 'suspended') {
    return resource === 'profile' && (action === 'read' || action === 'update')
  }

  // Pending users have limited permissions
  if (user.status === 'pending') {
    return canPending(user, action, resource, context)
  }

  // Admin can do everything (except approve own BOQ - SoD)
  if (user.role === 'admin') {
    if (action === 'approve' && context?.created_by === user.id) {
      return false // Separation of Duties
    }
    return true
  }

  // BOQ permissions
  if (resource === 'boq') {
    return canBOQ(user, action, context)
  }

  // User management - admin only
  if (resource === 'user') {
    return false // Only admin, handled above
  }

  // Profile - own profile only
  if (resource === 'profile') {
    return action === 'read' || action === 'update'
  }

  // Price list - everyone can read, admin only for write
  if (resource === 'price_list') {
    return action === 'read'
  }

  // Committee
  if (resource === 'committee') {
    return canCommittee(user, action, context)
  }

  return false
}

/**
 * Permissions for pending users (awaiting admin approval)
 * Limited to own BOQ only, no delete/approve
 */
function canPending(
  user: UserProfileWithOrg,
  action: Action,
  resource: Resource,
  ctx?: BOQContext
): boolean {
  // Profile - can read/update own
  if (resource === 'profile') {
    return action === 'read' || action === 'update'
  }

  // Price list - can read
  if (resource === 'price_list') {
    return action === 'read'
  }

  // BOQ - limited to own only (v1.2.0: only created_by, no assigned_to)
  if (resource === 'boq') {
    const isOwner = ctx?.created_by === user.id // No assigned_to for pending

    switch (action) {
      case 'create':
        return true // Can create new BOQ
      case 'read':
        return isOwner // Can only read own BOQ (no legacy, no assigned)
      case 'update':
        return isOwner // Can only update own BOQ
      case 'delete':
        return false // Cannot delete
      case 'approve':
        return false // Cannot approve
      default:
        return false
    }
  }

  // User management - no
  if (resource === 'user') {
    return false
  }

  // Committee - no
  if (resource === 'committee') {
    return false
  }

  return false
}

function canBOQ(
  user: UserProfileWithOrg,
  action: Action,
  ctx?: BOQContext
): boolean {
  const isOwner = ctx?.created_by === user.id || ctx?.assigned_to === user.id
  const isLegacy = ctx?.created_by === null || ctx?.created_by === undefined

  // v1.2.0: Explicit null handling for sector/department comparison
  const hasSector = Boolean(user.sector_id)
  const hasDepartment = Boolean(user.department_id)
  const isSameSector = hasSector && ctx?.sector_id != null && ctx.sector_id === user.sector_id
  const isSameDepartment = hasDepartment && ctx?.department_id != null && ctx.department_id === user.department_id

  // v1.2.0: Legacy BOQ admin-only (client-side hint, RLS enforces)
  // Active user without org sees only own
  if (!hasSector && !hasDepartment) {
    return isOwner || (action === 'create')
  }

  switch (user.role) {
    case 'staff':
      if (action === 'create') return true
      if (action === 'read') return isOwner || isSameSector || isLegacy
      if (action === 'update') return isOwner || isLegacy
      if (action === 'delete') return (isOwner && ctx?.status === 'draft') || isLegacy
      return false

    case 'sector_manager':
      if (action === 'read') return isSameSector || isSameDepartment || isLegacy
      if (['create', 'update'].includes(action)) return isSameSector || isLegacy
      if (action === 'delete') return isSameSector || isLegacy
      if (action === 'approve') {
        return isSameSector &&
          ctx?.status === 'pending_review' &&
          ctx?.created_by !== user.id // SoD
      }
      return false

    case 'dept_manager':
      if (action === 'read') return isSameDepartment || isLegacy
      if (['create', 'update', 'delete'].includes(action)) return isSameDepartment || isLegacy
      if (action === 'approve') {
        return isSameDepartment &&
          ctx?.status === 'pending_approval' &&
          ctx?.created_by !== user.id // SoD
      }
      return false

    case 'procurement':
      return action === 'read' && (isSameDepartment || isLegacy)

    default:
      return false
  }
}

function canCommittee(
  user: UserProfileWithOrg,
  action: Action,
  _ctx?: BOQContext
): boolean {
  if (user.role === 'admin') return true

  if (user.role === 'procurement') {
    // Procurement can manage committees they're assigned to
    // Full check requires committee context (not just BOQ context)
    return action === 'read' || action === 'update'
  }

  // Others can only read
  return action === 'read'
}

/**
 * Get display label for user role
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'ผู้ดูแลระบบ',
    dept_manager: 'ผู้จัดการฝ่าย',
    sector_manager: 'ผู้จัดการส่วน',
    staff: 'พนักงาน',
    procurement: 'จัดซื้อจัดจ้าง',
  }
  return labels[role] || role
}

/**
 * Get role badge color classes
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-800',
    dept_manager: 'bg-purple-100 text-purple-800',
    sector_manager: 'bg-blue-100 text-blue-800',
    staff: 'bg-gray-100 text-gray-800',
    procurement: 'bg-green-100 text-green-800',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

