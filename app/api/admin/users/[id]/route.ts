import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Create admin client with service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    // Verify the requester is an admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if requester is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Get target user info for confirmation
    const { data: targetUser } = await supabase
      .from('user_profiles')
      .select('email, status')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has any BOQ (created or assigned)
    const { data: userBoqs, error: boqError } = await supabase
      .from('boq')
      .select('id')
      .or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
      .limit(1)

    if (boqError) {
      console.error('Check BOQ error:', boqError)
      return NextResponse.json({ error: 'Failed to check user BOQs' }, { status: 500 })
    }

    if (userBoqs && userBoqs.length > 0) {
      return NextResponse.json({
        error: 'ไม่สามารถลบผู้ใช้ที่มี BOQ ได้ กรุณาเปลี่ยนสถานะเป็น "ไม่ใช้งาน" แทน'
      }, { status: 400 })
    }

    // Use admin client to delete user from auth.users
    const adminClient = createAdminClient()
    
    // Delete from auth.users (this will cascade to user_profiles via trigger/FK)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Delete user error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Also delete from user_profiles (in case no cascade)
    await supabase.from('user_profiles').delete().eq('id', userId)

    return NextResponse.json({ 
      success: true, 
      message: `User ${targetUser.email} deleted successfully` 
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

