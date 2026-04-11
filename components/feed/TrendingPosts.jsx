"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, TrendingUp, GraduationCap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TrendingPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTrending = async () => {
    try {
      const res = await fetch('/api/posts/trending')
      const data = await res.json()
      if (res.ok && data.posts?.length > 0) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrending()
    const interval = setInterval(fetchTrending, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending Today
        </div>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="space-y-2 p-2">
            <Skeleton className="h-4 w-full bg-secondary" />
            <Skeleton className="h-3 w-2/3 bg-secondary" />
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="text-lg font-bold">🔥 Trending Today</div>
      <div className="space-y-2">
        {posts.map((post, index) => (
          <Link
            key={post._id}
            href={`/post/${post._id}`}
            className="block p-2 rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-start gap-2">
              <span className="text-sm font-bold text-muted-foreground/60 w-4">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                {post.author && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{post.author.name}</span>
                    {' @'}{post.author.username}
                  </p>
                )}
                <p className="text-sm text-foreground/80 line-clamp-2 group-hover:text-foreground transition-colors">
                  {post.preview}
                </p>
                  {post.community && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {post.community}
                    </span>
                  )}
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.likesCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.commentsCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}