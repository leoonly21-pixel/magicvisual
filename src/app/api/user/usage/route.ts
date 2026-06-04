import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/user/usage - Increment photosUsed after a successful edit
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.photosUsed >= user.photosLimit) {
      return NextResponse.json({ error: 'Photo limit reached' }, { status: 403 })
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { photosUsed: user.photosUsed + 1 }
    })

    return NextResponse.json({
      success: true,
      photosUsed: updated.photosUsed,
      photosLimit: updated.photosLimit,
      canEdit: updated.photosUsed < updated.photosLimit
    })

  } catch (error: any) {
    console.error('Usage update error:', error)
    return NextResponse.json({ error: error.message || 'Error updating usage' }, { status: 500 })
  }
}

// GET /api/user/usage?userId=xxx - Get current usage
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { photosUsed: true, photosLimit: true, plan: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      photosUsed: user.photosUsed,
      photosLimit: user.photosLimit,
      plan: user.plan,
      canEdit: user.photosUsed < user.photosLimit
    })

  } catch (error: any) {
    console.error('Usage fetch error:', error)
    return NextResponse.json({ error: error.message || 'Error fetching usage' }, { status: 500 })
  }
}
