// client/src/pages/messaging/MessagesPage.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { 
  getMyConversations, 
  getConversationMessages, 
  sendMessage as sendMessageAPI,
  markMessageAsRead,
  deleteMessage,
  getUnreadMessagesCount
} from '../../services/message.service';
import { 
  onReceiveMessage, 
  onUserTyping, 
  onMessageRead,
  sendTyping
} from '../../services/socket.service';
import {
  Send,
  Paperclip,
  ArrowLeft,
  CheckCheck,
  Check,
  Loader2,
  MessageCircle,
  Trash2,
  MoreVertical,
  X,
} from 'lucide-react';

// ============ CONSTANTS ============
const MESSAGES_PER_PAGE = 50;
const TYPING_DEBOUNCE_MS = 2000;

export function MessagesPage() {
  // ============ CONTEXT & ROUTER ============
  const { currentUser } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationFromUrl = searchParams.get('conversation');

  // ============ STATE ============
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ============ REFS ============
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isInitialMountRef = useRef(true);

  // ============ DERIVED VALUES ============
  const currentUserId = currentUser?.id || currentUser?._id;

  /**
   * Extract the other participant from a conversation
   */
  const getOtherParticipant = useCallback((conv) => {
    if (!conv?.participants || !currentUserId) return null;
    
    return conv.participants.find(p => {
      const participantId = p?._id?.toString() || p?.toString();
      return participantId !== currentUserId?.toString();
    });
  }, [currentUserId]);

  const activeConv = useMemo(
    () => conversations.find(c => c._id === activeConversationId),
    [conversations, activeConversationId]
  );
  
  const activeParticipant = useMemo(
    () => getOtherParticipant(activeConv),
    [activeConv, getOtherParticipant]
  );

  // ============ SCROLL MANAGEMENT ============
  /**
   * Scroll to bottom of messages container
   * Only scrolls if user is near bottom (prevents annoying jumps)
   */
  const scrollToBottom = useCallback((force = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (force || isNearBottom) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, []);

  // ============ DATA FETCHING ============
  /**
   * Fetch all conversations for current user
   */
  const fetchConversations = useCallback(async () => {
    try {
      const response = await getMyConversations();
      
      if (response.success) {
        setConversations(response.conversations);
        
        // Prioritize conversation from URL
        if (conversationFromUrl) {
          setActiveConversationId(conversationFromUrl);
          setShowMobileChat(true);
        } else if (response.conversations.length > 0 && !activeConversationId) {
          setActiveConversationId(response.conversations[0]._id);
        }
      }
    } catch (error) {
      console.error('[MessagesPage] Failed to fetch conversations:', error);
      toast.error('Load Failed', 'Could not load conversations.');
    } finally {
      setIsLoading(false);
    }
  }, [conversationFromUrl, activeConversationId, toast]);

  /**
   * Fetch messages for a specific conversation
   */
  const fetchMessages = useCallback(async (conversationId, page = 1, append = false) => {
    try {
      const response = await getConversationMessages(conversationId, page, MESSAGES_PER_PAGE);
      
      if (response.success) {
        setMessages(prev => 
          append ? [...response.messages, ...prev] : response.messages
        );
        setHasMoreMessages(response.hasMore || false);
        setCurrentPage(page);
        
        if (!append) {
          scrollToBottom(true);
        }
      }
    } catch (error) {
      console.error('[MessagesPage] Failed to fetch messages:', error);
      toast.error('Load Failed', 'Could not load messages.');
    }
  }, [scrollToBottom, toast]);

  /**
   * Fetch unread message count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadMessagesCount();
      if (response.success) {
        setUnreadTotal(response.count || 0);
      }
    } catch (error) {
      // Silent fail - unread count is non-critical
      console.error('[MessagesPage] Failed to fetch unread count:', error);
    }
  }, []);

  // ============ EFFECTS ============
  /**
   * Initial data load
   */
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, [fetchConversations, fetchUnreadCount]);

  /**
   * Load messages when active conversation changes
   */
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      
      // Clear search param after loading
      if (conversationFromUrl) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('conversation');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [activeConversationId, fetchMessages, conversationFromUrl, searchParams, setSearchParams]);

  /**
   * Handle conversation from URL (e.g., from FreelancerProfilePage)
   */
  useEffect(() => {
    if (conversationFromUrl) {
      setActiveConversationId(conversationFromUrl);
      setShowMobileChat(true);
      fetchMessages(conversationFromUrl);
    }
  }, [conversationFromUrl, fetchMessages]);

  /**
   * Real-time message listener
   */
  useEffect(() => {
    const unsubscribe = onReceiveMessage((data) => {
      if (!data?.message) return;

      const messageConversationId = data.conversationId;
      const isActiveConversation = messageConversationId === activeConversationId;

      // Add message if active conversation
      if (isActiveConversation) {
        setMessages(prev => {
          if (prev.some(m => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }

      // Update conversation list
      setConversations(prev => {
        const conversationIndex = prev.findIndex(c => c._id === messageConversationId);
        
        if (conversationIndex === -1) {
          // Conversation doesn't exist locally, refetch
          fetchConversations();
          return prev;
        }

        const updatedConversations = [...prev];
        const conversation = { ...updatedConversations[conversationIndex] };
        
        conversation.lastMessage = {
          message: data.message.message,
          senderId: data.message.senderId
        };
        conversation.updatedAt = new Date();
        conversation.unreadCount = isActiveConversation 
          ? 0 
          : (conversation.unreadCount || 0) + 1;
        
        updatedConversations[conversationIndex] = conversation;
        
        // Move conversation to top
        const [movedConversation] = updatedConversations.splice(conversationIndex, 1);
        updatedConversations.unshift(movedConversation);
        
        return updatedConversations;
      });

      // Scroll if active conversation
      if (isActiveConversation) {
        scrollToBottom();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [activeConversationId, fetchConversations, scrollToBottom]);

  /**
   * Typing indicator listener
   */
  useEffect(() => {
    const unsubscribe = onUserTyping((data) => {
      setIsTyping(data?.isTyping || false);
      setTypingUser(data?.userName || null);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  /**
   * Message read receipt listener
   */
  useEffect(() => {
    const unsubscribe = onMessageRead((data) => {
      if (data?.messageId) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, isRead: true } 
              : msg
          )
        );
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  /**
   * Auto-scroll when messages change (but not on input typing)
   */
  useEffect(() => {
    if (!isInitialMountRef.current) {
      scrollToBottom();
    }
    isInitialMountRef.current = false;
  }, [messages.length, isTyping, scrollToBottom]);

  // ============ EVENT HANDLERS ============
  /**
   * Handle sending a message
   */
  const handleSend = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = inputText.trim();
    if (!trimmedMessage || !activeConversationId || isSending) return;

    setIsSending(true);
    const receiverId = activeParticipant?._id || activeParticipant;

    try {
      const response = await sendMessageAPI({
        conversationId: activeConversationId,
        receiverId,
        message: trimmedMessage,
      });

      if (response.success && response.data) {
        // Append new message
        setMessages(prev => [...prev, response.data]);
        setInputText('');
        scrollToBottom(true);
        
        // Update conversation list
        setConversations(prev => {
          const index = prev.findIndex(c => c._id === activeConversationId);
          if (index === -1) return prev;
          
          const updated = [...prev];
          const conversation = { ...updated[index] };
          conversation.lastMessage = { message: trimmedMessage };
          conversation.updatedAt = new Date();
          
          const [moved] = updated.splice(index, 1);
          updated.unshift(moved);
          return updated;
        });
      }
    } catch (error) {
      console.error('[MessagesPage] Failed to send message:', error);
      toast.error('Send Failed', error.response?.data?.message || 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle typing with debounce
   */
  const handleTyping = (e) => {
    const value = e.target.value;
    setInputText(value);
    
    const receiverId = activeParticipant?._id || activeParticipant;
    
    if (receiverId) {
      // Debounce typing indicator
      sendTyping(receiverId, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(receiverId, false);
      }, TYPING_DEBOUNCE_MS);
    }
  };

  /**
   * Handle message deletion
   */
  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;
    
    try {
      const response = await deleteMessage(messageId);
      
      if (response.success) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        setDeleteTarget(null);
        toast.success('Deleted', 'Message deleted successfully.');
      }
    } catch (error) {
      console.error('[MessagesPage] Failed to delete message:', error);
      toast.error('Delete Failed', 'Could not delete message.');
    }
  };

  /**
   * Load older messages (pagination)
   */
  const handleLoadOlder = async () => {
    if (activeConversationId && hasMoreMessages) {
      await fetchMessages(activeConversationId, currentPage + 1, true);
    }
  };

  /**
   * Mark message as read
   */
  const handleMarkAsRead = async (messageId) => {
    try {
      await markMessageAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      // Silent fail
    }
  };

  /**
   * Format timestamp for conversation list
   */
  const formatTime = useCallback((date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, []);

  /**
   * Format full timestamp for message groups
   */
  const formatFullTime = useCallback((date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return d.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  /**
   * Check if a message should show date separator
   */
  const shouldShowDateSeparator = useCallback((currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.createdAt);
    const prevDate = new Date(prevMsg.createdAt);
    
    return currentDate.toDateString() !== prevDate.toDateString();
  }, []);

  /**
   * Filter conversations by search
   */
  const filteredConversations = useMemo(() => {
    if (!searchContact.trim()) return conversations;
    
    const query = searchContact.toLowerCase();
    return conversations.filter(c => {
      const participant = getOtherParticipant(c);
      return participant?.name?.toLowerCase().includes(query) || false;
    });
  }, [conversations, searchContact, getOtherParticipant]);

  /**
   * Handle conversation selection
   */
  const handleConversationSelect = useCallback((conversationId) => {
    setActiveConversationId(conversationId);
    setShowMobileChat(true);
    
    // Reset unread for this conversation
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, unreadCount: 0 } 
          : conv
      )
    );
  }, []);

  // ============ RENDER ============
  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft overflow-hidden flex min-h-0">
        {/* ============ LEFT PANE - CONVERSATION LIST ============ */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Messages</h2>
              {unreadTotal > 0 ? (
                <Badge variant="danger" size="sm">{unreadTotal} unread</Badge>
              ) : (
                <Badge variant="primary" size="sm">{conversations.length}</Badge>
              )}
            </div>
            
            <SearchBar 
              value={searchContact} 
              onChange={setSearchContact} 
              placeholder="Search conversations..." 
              size="sm" 
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isActive = conv._id === activeConv?._id;
                const participant = getOtherParticipant(conv);
                const unreadCount = conv.unreadCount || 0;

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleConversationSelect(conv._id)}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary-50/60 dark:bg-primary-950/40 border-l-2 border-primary-500' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-850/50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar 
                        src={participant?.avatar} 
                        name={participant?.name} 
                        size="md" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {participant?.name || 'Unknown'}
                        </h4>
                        {conv.updatedAt && (
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                            {formatTime(conv.updatedAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <p className={`text-xs truncate flex-1 ${
                          unreadCount > 0 
                            ? 'font-semibold text-slate-900 dark:text-white' 
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {conv.lastMessage?.message || 'Start conversation'}
                        </p>
                        
                        {unreadCount > 0 ? (
                          <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {unreadCount}
                          </span>
                        ) : conv.lastMessage && (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <MessageCircle className="w-12 h-12 mb-3 text-slate-300" />
                <p className="text-xs font-semibold">No conversations yet</p>
                <p className="text-[10px] mt-1">Start chatting with freelancers</p>
              </div>
            )}
          </div>
        </div>

        {/* ============ RIGHT PANE - CHAT WINDOW ============ */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/50 ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
          {activeConv && activeParticipant ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button 
                    onClick={() => setShowMobileChat(false)} 
                    className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <Avatar 
                    src={activeParticipant?.avatar} 
                    name={activeParticipant?.name} 
                    size="md" 
                  />
                  
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeParticipant?.name || 'Unknown'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeParticipant?.role || 'User'} • {activeParticipant?.email || ''}
                    </p>
                  </div>
                </div>
                
                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30"
              >
                {/* Load older messages */}
                {hasMoreMessages && (
                  <div className="text-center mb-4">
                    <button
                      onClick={handleLoadOlder}
                      className="text-xs text-primary-600 hover:underline font-semibold"
                    >
                      Load older messages
                    </button>
                  </div>
                )}

                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const senderId = msg.senderId?._id?.toString() || msg.senderId?.toString();
                    const isMe = senderId === currentUserId?.toString();
                    const senderName = msg.senderId?.name || 'User';
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showDateSeparator = shouldShowDateSeparator(msg, prevMsg);

                    return (
                      <React.Fragment key={msg._id}>
                        {/* Date Separator */}
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-4">
                            <span className="px-3 py-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                              {formatFullTime(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        <div className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <span className="text-[10px] text-slate-400 mb-1 ml-1">{senderName}</span>
                          )}
                          
                          <div className="relative max-w-[75%] sm:max-w-[60%]">
                            <div className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-md'
                            }`}>
                              <p className="whitespace-pre-line break-words">{msg.message}</p>
                            </div>
                            
                            {/* Delete button - appears on hover */}
                            {isMe && (
                              <button
                                onClick={() => setDeleteTarget(msg._id)}
                                className="absolute top-1/2 -translate-y-1/2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                                aria-label="Delete message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              msg.isRead 
                                ? <CheckCheck className="w-3 h-3 text-emerald-500" />
                                : <Check className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageCircle className="w-12 h-12 mb-3 text-slate-300" />
                    <p className="text-sm font-semibold">No messages yet</p>
                    <p className="text-xs mt-1">Say hello! 👋</p>
                  </div>
                )}

                {/* Typing Indicator */}
                {isTyping && typingUser && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-4">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span>{typingUser} is typing...</span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <form 
                onSubmit={handleSend} 
                className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
              >
                <button 
                  type="button" 
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={handleTyping}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md" 
                  icon={Send} 
                  disabled={!inputText.trim() || isSending} 
                  isLoading={isSending}
                  className="shrink-0"
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageCircle className="w-16 h-16 mb-4 text-slate-300" />
              <p className="text-sm font-semibold">Select a conversation</p>
              <p className="text-xs mt-1">Choose a conversation from the left to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Delete Message?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                This message will be permanently deleted.
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDeleteMessage(deleteTarget)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;