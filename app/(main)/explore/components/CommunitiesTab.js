"use client"

import { useState, useEffect } from "react"
import { Users, RefreshCw, Building2, TrendingUp, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import EmptyState from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { slugifyCollege } from "@/utils/formatters"
import Link from "next/link"

export default function CommunitiesTab({ currentUser }) {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCommunities = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/explore/communities')
      const data = await res.json()

      if (res.ok) {
        setCommunities(data.communities || [])
      } else {
        throw new Error(data.message || "Failed to fetch communities")
      }
    } catch (error) {
      console.error("Explore communities error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchCommunities()
    }
  }, [currentUser])

  const handleRefresh = () => {
    fetchCommunities()
  }

  if (loading && communities.length === 0) {
    return (
      <div className="p-4 space-y-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Discover communities</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 px-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Communities list */}
      <div className="flex-1">
        {communities.length === 0 && !loading ? (
          <div className="pt-20">
            <EmptyState
              icon={Users}
              title="No communities yet"
              description="Communities will appear here as people post with college names!"
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {communities.map((community, index) => (
              <Link 
                key={community.name} 
                href={`/community/${slugifyCollege(community.name)}`}
                className="block hover:bg-accent/30 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Community icon/rank */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                        <span className="text-2xl font-black text-primary/40">
                          {community.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Community info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg truncate">
                          🎓 {community.name}
                        </h3>
                        {index < 3 && (
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {community.totalMembers || 0} members
                        </span>
                        {community.recentPostCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {community.recentPostCount} posts this week
                          </span>
                        )}
                      </div>

                      {/* Activity indicator */}
                      {community.recentPostCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1">
                            {Array(Math.min(3, community.recentPostCount)).fill(0).map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-primary/60 border border-background"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-primary/60">
                            {community.recentPostCount >= 10 ? 'Very active' : 
                             community.recentPostCount >= 5 ? 'Active' : 'Recently active'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Join button indicator */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
