"use client"

import { useState, useCallback } from 'react'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Pin, 
  Link2, 
  VolumeX, 
  Ban, 
  Flag, 
  AlertTriangle
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { isAdmin, isFounder } from '@/lib/admin'
import ReportModal from './ReportModal'
import EditPostModal from './EditPostModal'

export default function PostOptionsMenu({ 
  post, 
  currentUser, 
  onPostDeleted, 
  onPostUpdated 
}) {
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [isMuting, setIsMuting] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)

  const authorId = post.author?._id || post.author
  const isOwner = authorId && currentUser?._id && (
    authorId === currentUser._id || 
    authorId.toString() === currentUser._id.toString()
  )
  const isAdminUser = currentUser && (currentUser.role === 'admin' || isFounder(currentUser) || isAdmin(currentUser))

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/post/${post._id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }, [post._id])

  const handleMute = useCallback(async () => {
    if (isMuting) return
    setIsMuting(true)
    try {
      const res = await fetch('/api/users/mute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: post.author?._id || post.author })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(`Muted @${post.author?.username}`)
    } catch (error) {
      toast.error(error.message || 'Failed to mute user')
    } finally {
      setIsMuting(false)
    }
  }, [post.author, isMuting])

  const handleBlock = useCallback(async () => {
    if (isBlocking) return
    setIsBlocking(true)
    try {
      const res = await fetch('/api/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: post.author?._id || post.author })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(`Blocked @${post.author?.username}`)
      setShowBlockConfirm(false)
    } catch (error) {
      toast.error(error.message || 'Failed to block user')
    } finally {
      setIsBlocking(false)
    }
  }, [post.author, isBlocking])

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Post deleted')
      if (onPostDeleted) onPostDeleted(post._id)
    } catch (error) {
      toast.error(error.message || 'Failed to delete post')
    }
  }, [post._id, onPostDeleted])

  const handlePin = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${post._id}/pin`, {
        method: 'PATCH'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(data.isPinned ? 'Post pinned to profile' : 'Post unpinned')
      if (onPostUpdated) onPostUpdated({ ...post, isPinned: data.isPinned })
    } catch (error) {
      toast.error(error.message || 'Failed to pin post')
    }
  }, [post._id, post, onPostUpdated])

  const handleAdminDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to remove this post? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/posts/${post._id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Post removed by admin')
      if (onPostDeleted) onPostDeleted(post._id)
    } catch (error) {
      toast.error(error.message || 'Failed to remove post')
    }
  }, [post._id, onPostDeleted])

  const handleAdminBan = useCallback(async () => {
    if (!window.confirm(`Ban @${post.author?.username}? They will no longer be able to access the platform.`)) return
    try {
      const res = await fetch(`/api/admin/users/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: post.author?._id || post.author })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(`Banned @${post.author?.username}`)
    } catch (error) {
      toast.error(error.message || 'Failed to ban user')
    }
  }, [post.author])

  const handleReportSuccess = useCallback(() => {
    setShowReportModal(false)
    toast.success('Report submitted. We\'ll review it shortly 🙏')
  }, [])

  const handleEditSuccess = useCallback((updatedPost) => {
    setShowEditModal(false)
    toast.success('Post updated successfully')
    if (onPostUpdated) onPostUpdated(updatedPost)
  }, [onPostUpdated])

  return (
    <>
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            {/* Owner options */}
            {isOwner && (
              <>
                <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePin}>
                  <Pin className="w-4 h-4 mr-2" />
                  {post.isPinned ? 'Unpin from profile' : 'Pin to Profile'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </>
            )}

            {/* Non-owner options */}
            {!isOwner && (
              <>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMute} disabled={isMuting}>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Mute @{post.author?.username}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBlockConfirm(true)}>
                  <Ban className="w-4 h-4 mr-2" />
                  Block @{post.author?.username}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowReportModal(true)} className="text-amber-500">
                  <Flag className="w-4 h-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
              </>
            )}

            {/* Admin options - show for everyone including owner */}
            {isAdminUser && !isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Admin Actions
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={handleAdminDelete} className="text-destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Remove Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAdminBan} className="text-destructive">
                  <Ban className="w-4 h-4 mr-2" />
                  Ban User
                </DropdownMenuItem>
              </>
            )}

            {/* Admin can also remove own posts but with different flow */}
            {isAdminUser && isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAdminDelete} className="text-destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Remove Post (Admin)
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Block confirmation AlertDialog */}
      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Block @{post.author?.username}?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            They will not be able to follow you, message you, or see your posts.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="ghost" onClick={() => setShowBlockConfirm(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleBlock} disabled={isBlocking}>
                {isBlocking ? 'Blocking...' : 'Block'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          post={post}
          onClose={() => setShowReportModal(false)}
          onSuccess={handleReportSuccess}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}