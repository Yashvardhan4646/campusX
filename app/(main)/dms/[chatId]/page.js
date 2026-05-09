"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Info, Loader2, ChevronUp, Mail, Calendar, Shield, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import useUser from "@/hooks/useUser"
import { useDmNotifications } from "@/hooks/useDmNotifications"
import MessageBubble from "@/components/chat/MessageBubble"
import MessageInput from "@/components/chat/MessageInput"
import TypingIndicator from "@/components/chat/TypingIndicator"

export default function DmChatPage({ params: paramsPromise }) {
  const params = use(paramsPromise)
  const chatId = params.chatId
  const router = useRouter()
  const { user: currentUser } = useUser()
  
  const [messages, setMessages] = useState([])
  const [chat, setChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [typingUsers, setTypingUsers] = useState({})
  const [infoOpen, setInfoOpen] = useState(false)

  const messagesContainerRef = useRef(null)
  const bottomRef = useRef(null)

  // ━━━ Fetching ━━━
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const [chatRes, messagesRes] = await Promise.all([
        fetch(`/api/dms/${chatId}`),
        fetch(`/api/dms/${chatId}/messages?limit=30`)
      ])

      const chatData = await chatRes.json()
      const messagesData = await messagesRes.json()

      if (chatRes.ok) setChat(chatData.chat)
      if (messagesRes.ok) {
        setMessages(messagesData.messages)
        setHasMore(messagesData.hasMore)
        setCursor(messagesData.nextCursor)
      }

      // Mark as read
      fetch(`/api/dms/${chatId}/read`, { method: 'POST' }).catch(() => {})
      
      // Initial scroll
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Chat data fetch error:', error)
      toast.error("Failed to load chat")
    } finally {
      setLoading(false)
    }
  }, [chatId])

  useEffect(() => {
    if (chatId) fetchInitialData()
  }, [chatId, fetchInitialData])

  const loadOlderMessages = async () => {
    if (!cursor || loadingOlder) return
    
    const savedScrollHeight = messagesContainerRef.current.scrollHeight 
    setLoadingOlder(true)
    
    try {
      const res = await fetch(`/api/dms/${chatId}/messages?cursor=${cursor}&limit=30`) 
      const data = await res.json()
      
      if (res.ok) {
        setMessages(prev => [...data.messages, ...prev]) 
        setCursor(data.nextCursor) 
        setHasMore(data.hasMore) 
        
        // Maintain scroll position
        requestAnimationFrame(() => { 
          if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight 
            messagesContainerRef.current.scrollTop = newScrollHeight - savedScrollHeight 
          }
        })
      }
    } catch (error) {
      console.error('Load older error:', error)
    } finally {
      setLoadingOlder(false)
    }
  }

  // ━━━ Real-time Handlers ━━━
  const { joinPresenceChannel } = useDmNotifications({
    onNewMessage: useCallback((data) => {
      if (data.chatId === chatId) {
        setMessages(prev => {
          // 1. If message has clientId, try to replace optimistic message
          if (data.message.clientId) {
            const index = prev.findIndex(m => m.clientId === data.message.clientId)
            if (index !== -1) {
              const next = [...prev]
              next[index] = { ...data.message, isOptimistic: false }
              return next
            }
          }

          // 2. Avoid duplicates if already added
          if (prev.some(m => m._id === data.message._id)) return prev
          return [...prev, data.message]
        })
        
        // Auto-scroll if near bottom
        if (isNearBottom()) {
          setTimeout(scrollToBottom, 50)
        }
        
        // Mark as read
        fetch(`/api/dms/${chatId}/read`, { method: 'POST' }).catch(() => {})
      }
    }, [chatId]),
    onRequestAccepted: () => {},
    onRequestRejected: () => {}
  })

  useEffect(() => {
    if (chat && currentUser) {
      joinPresenceChannel(chatId)
    }
  }, [chatId, currentUser, joinPresenceChannel])

  const onMessageDeleted = useCallback(({ messageId }) => {
    setMessages(prev => prev.map(m => 
      m._id === messageId 
        ? { ...m, isDeleted: true, content: '', imageUrl: '' } 
        : m 
    ))
  }, [])

  const onTypingStart = useCallback(({ userId, userName, userAvatar }) => {
    if (userId === currentUser?._id) return
    setTypingUsers(prev => ({ 
      ...prev, 
      [userId]: { name: userName, avatar: userAvatar } 
    }))
  }, [currentUser])

  const onTypingStop = useCallback(({ userId }) => {
    setTypingUsers(prev => { 
      const next = { ...prev } 
      delete next[userId] 
      return next 
    })
  }, [])

  const onReaction = useCallback(({ messageId, reactions }) => {
    setMessages(prev => prev.map(m => 
      m._id === messageId ? { ...m, reactions } : m 
    ))
  }, [])

  // ━━━ Actions ━━━
  const handleSend = async (content) => {
    if (!content.trim()) return

    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Optimistic message
    const optimisticMsg = {
      _id: clientId,
      clientId,
      content,
      type: 'text',
      sender: {
        _id: currentUser._id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        username: currentUser.username
      },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      reactions: []
    }

    // Add to UI immediately
    setMessages(prev => [...prev, optimisticMsg])
    setTimeout(scrollToBottom, 50)

    try {
      const res = await fetch(`/api/dms/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'text', clientId })
      })
      
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.message || "Failed to send message")
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.clientId !== clientId))
      }
    } catch (error) {
      toast.error("Network error")
      setMessages(prev => prev.filter(m => m.clientId !== clientId))
    }
  }

  const handleTyping = (isTyping) => {
    // This would need presence channel implementation
    // For now, we'll skip typing indicators
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await fetch(`/api/dms/${chatId}/messages/${messageId}`, {
        method: 'DELETE'
      })
      if (!res.ok) toast.error("Failed to delete message")
    } catch (error) {
      toast.error("Error deleting message")
    }
  }

  const handleReact = async (messageId, emoji) => {
    try {
      const res = await fetch(`/api/dms/${chatId}/messages/${messageId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })
      if (!res.ok) toast.error("Failed to react")
    } catch (error) {
      toast.error("Error reacting")
    }
  }

  // ━━━ Helpers ━━━
  const scrollToBottom = () => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }

  const isNearBottom = () => { 
    const container = messagesContainerRef.current 
    if (!container) return true 
    return container.scrollHeight - container.scrollTop - container.clientHeight < 150 
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading chat...</p>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    )
  }

  const participant = chat.participant

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative"> 
      
      {/* ━━━ Chat Header ━━━ */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur border-b border-border z-10"> 
        <div className="flex items-center gap-3 px-4 py-3"> 
          <Button variant="ghost" size="icon" onClick={() => router.push('/chats')} className="rounded-full"> 
            <ArrowLeft className="w-5 h-5" /> 
          </Button> 

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 
                          border border-border flex items-center justify-center font-bold flex-shrink-0 overflow-hidden relative"> 
            {participant?.avatar 
              ? <img 
                  src={participant.avatar} 
                  alt={participant.name} 
                  className="object-cover w-full h-full"
                /> 
              : participant?.name?.charAt(0)?.toUpperCase() 
            } 
          </div> 

          <div className="flex-1 min-w-0"> 
            <p className="font-semibold text-sm truncate">{participant?.name}</p> 
            <p className="text-[11px] text-muted-foreground"> 
              @{participant?.username}
              {participant?.college && ` • ${participant?.college}`} 
            </p> 
          </div> 

          <Button variant="ghost" size="icon" onClick={() => setInfoOpen(true)} className="rounded-full"> 
            <Info className="w-4 h-4" /> 
          </Button> 
        </div> 
      </div> 

      {/* ━━━ Messages Area ━━━ */}
      <div 
        ref={messagesContainerRef} 
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 custom-scrollbar min-h-0" 
      > 
        {hasMore && ( 
          <div className="text-center py-4"> 
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadOlderMessages} 
              disabled={loadingOlder} 
              className="text-xs text-muted-foreground hover:bg-accent/50" 
            > 
              {loadingOlder 
                ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> 
                : <ChevronUp className="w-3 h-3 mr-1" /> 
              } 
              Load older messages 
            </Button> 
          </div> 
        )} 

        {messages.map((message, i) => ( 
          <MessageBubble 
            key={message._id} 
            message={message} 
            isOwn={message.sender?._id === currentUser?._id} 
            showAvatar={ 
              i === 0 || messages[i-1]?.sender?._id !== message.sender?._id 
            } 
            currentUserId={currentUser?._id} 
            onDelete={handleDeleteMessage} 
            onReact={handleReact} 
          /> 
        ))} 

        {Object.keys(typingUsers).length > 0 && ( 
          <TypingIndicator users={Object.values(typingUsers)} /> 
        )} 

        <div ref={bottomRef} className="h-4" /> 
      </div> 

      {/* ━━━ Message Input ━━━ */}
      <div className="flex-shrink-0">
        <MessageInput 
          onSend={handleSend} 
          onTyping={handleTyping} 
          sending={sending} 
          chatId={chatId} 
        /> 
      </div>
    </div> 
  )
}
