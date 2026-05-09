import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  MessageCircle, 
  Check, 
  X, 
  Lock, 
  Users,
  Shield,
  GraduationCap
} from 'lucide-react'

export default function UserSearchResult({ 
  users, 
  loading, 
  onSelectUser,
  onRequestChat 
}) {
  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'verified':
        return <Shield className="w-3 h-3" />
      case 'college':
        return <GraduationCap className="w-3 h-3" />
      case 'followers':
        return <Users className="w-3 h-3" />
      case 'none':
        return <Lock className="w-3 h-3" />
      default:
        return null
    }
  }

  const getPrivacyText = (privacy) => {
    switch (privacy) {
      case 'verified':
        return 'Verified users only'
      case 'college':
        return 'Same college only'
      case 'followers':
        return 'Followers only'
      case 'none':
        return 'Not accepting messages'
      default:
        return 'Accepting messages'
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-medium text-muted-foreground mb-1">
          No users found
        </h3>
        <p className="text-sm text-muted-foreground">
          Try searching with a different username
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card key={user._id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={user.avatar} 
                  alt={user.name}
                />
                <AvatarFallback>
                  {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {user.name || user.username}
                  </h4>
                  {user.isVerified && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      ✓
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>@{user.username}</span>
                  {user.college && (
                    <>
                      <span>•</span>
                      <span>{user.college}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    {getPrivacyIcon(user.chatPrivacy)}
                    <span className={user.canMessage ? 'text-green-600' : 'text-muted-foreground'}>
                      {getPrivacyText(user.chatPrivacy)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.hasExistingChat && (
                      <Badge variant="outline" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Chat exists
                      </Badge>
                    )}
                    
                    {user.hasPendingRequest && (
                      <Badge variant="secondary" className="text-xs">
                        Request sent
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      onClick={() => {
                        if (user.hasExistingChat) {
                          onSelectUser(user)
                        } else if (user.canMessage && !user.hasPendingRequest) {
                          onRequestChat(user)
                        }
                      }}
                      disabled={
                        !user.canMessage || 
                        user.hasPendingRequest || 
                        user.hasExistingChat
                      }
                      className="text-xs"
                    >
                      {user.hasExistingChat ? (
                        <>
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Open Chat
                        </>
                      ) : user.hasPendingRequest ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Requested
                        </>
                      ) : !user.canMessage ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Restricted
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
