import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Report from '@/models/Report'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser(request)

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { reportId } = await params
    const body = await request.json()
    const { status } = body

    if (!['reviewed', 'dismissed', 'actioned'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
    }

    const report = await Report.findById(reportId)

    if (!report) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 })
    }

    report.status = status
    await report.save()

    return NextResponse.json({ message: 'Report updated', report })
  } catch (error) {
    console.error('[ReportPATCH] Error:', error.message)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}