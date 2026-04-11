"use client"

import { useState, useEffect } from 'react'
import { Pencil, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const MAX_CONTENT_LENGTH = 2000

export default function EditPostModal({ post, onClose, onSuccess }) {
  const [content, setContent] = useState(post.content || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setContent(post.content || '')
  }, [post])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || content.length > MAX_CONTENT_LENGTH) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      onSuccess({ ...post, content: content.trim() })
    } catch (error) {
      alert(error.message || 'Failed to update post')
    } finally {
      setIsSaving(false)
    }
  }

  const remainingChars = MAX_CONTENT_LENGTH - content.length
  const isOverLimit = remainingChars < 0

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              className="resize-none text-base"
              maxLength={MAX_CONTENT_LENGTH + 100}
            />
            <div className={`text-xs text-right ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {content.length} / {MAX_CONTENT_LENGTH} characters
              {isOverLimit && ` (${Math.abs(remainingChars)} over limit)`}
            </div>
          </div>

          {post.images?.length > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                📷 {post.images.length} attached image{post.images.length > 1 ? 's' : ''} (cannot be edited)
              </p>
            </div>
          )}

          {post.poll && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                📊 Poll attached (cannot be edited)
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || !content.trim() || isOverLimit}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}