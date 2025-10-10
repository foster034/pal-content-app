import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Use service role key to check users
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user by email
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: `User with email ${email} does not exist`
      })
    }

    // Check profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*, roles(name)')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at
      },
      profile: profile || null
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
