"use client"

import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading', description: 'This is spam or misleading content' },
  { value: 'harassment', label: 'Harassment or bullying', description: 'This is harassing or bullying behavior' },
  { value: 'inappropriate', label: 'Inappropriate content', description: 'This contains inappropriate or offensive content' },
  { value: 'misinformation', label: 'Fake news / misinformation', description: 'This contains false or misleading information' },
  { value: 'other', label: 'Other', description: 'Something else that violates our guidelines' },
]

export default function ReportModal({ post, onClose, onSuccess }) {
  const [reason, setReason] = useState('spam')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          reason,
          description: reason === 'other' ? description : ''
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      onSuccess()
    } catch (error) {
      alert(error.message || 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            Report Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.content || 'Post content'}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Why are you reporting this?</Label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <div
                  key={r.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    reason === r.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:bg-accent/50 hover:border-accent'
                  }`}
                  onClick={() => setReason(r.value)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    reason === r.value ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {reason === r.value && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                  </div>
                  <Label className="flex flex-col cursor-pointer">
                    <span className="text-sm font-medium">{r.label}</span>
                    <span className="text-xs text-muted-foreground">{r.description}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {reason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Additional details (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue..."
                maxLength={500}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}