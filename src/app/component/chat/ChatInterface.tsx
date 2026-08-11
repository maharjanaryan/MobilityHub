// src/app/component/chat/ChatInterface.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, User, Users, X, MessageSquare,
  Check, CheckCheck, Clock, Phone, Video,
  MoreVertical, ArrowLeft, Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import chatService from '../../services/chatService';

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface Conversation {
  id: number;
  otherUserId: number;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatInterfaceProps {
  userId: number;
  token: string;
  initialConversationId?: number;
}

export default function ChatInterface({ userId, token, initialConversationId }: ChatInterfaceProps) {
  // 🔍 DEBUG LOG 3 — did the component even mount, and with what props?
  console.log('🔍 [ChatInterface] MOUNTED with props:', { userId, token, initialConversationId });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Refs to avoid stale closures inside socket callbacks that are only
  // registered once (on mount / when token or userId change).
  const currentConversationRef = useRef<Conversation | null>(null);
  const userIdRef = useRef<number>(userId);

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Connect to WebSocket (runs once per token/userId)
  useEffect(() => {
    // 🔍 DEBUG LOG 4 — does this effect run, and with what values?
    console.log('🔍 [ChatInterface] connect effect firing with:', { token, userId });

    if (token && userId) {
      console.log('🔍 [ChatInterface] Calling chatService.connect() NOW');
      chatService.connect(token, userId);

      chatService.onMessage((message: Message) => {
        console.log('🔍 [ChatInterface] onMessage fired:', message);
        handleNewMessage(message);
      });

      chatService.onReadReceipt((conversationId: number) => {
        console.log('🔍 [ChatInterface] onReadReceipt fired:', conversationId);
        handleReadReceipt(conversationId);
      });

      return () => {
        console.log('🔍 [ChatInterface] cleanup — disconnecting');
        chatService.disconnect();
      };
    } else {
      console.log('🔍 [ChatInterface] SKIPPED connect — token or userId falsy', { token, userId });
    }
  }, [token, userId]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      setIsInitialLoad(true);
      fetchMessages(currentConversation.id);
      markMessagesAsRead(currentConversation.id);
    }
  }, [currentConversation]);

  // Scroll to bottom only when sending or receiving new messages (not on initial load)
  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !currentConversationRef.current) {
          setCurrentConversation(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    const textToSend = newMessage.trim();
    setNewMessage(''); // clear input immediately for snappy UX

    try {
      const messageData = {
        receiverId: currentConversation.otherUserId,
        message: textToSend
      };

      const response = await fetch('http://localhost:8080/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const sentMessage = await response.json();

        setMessages(prev => {
          if (prev.some(m => m.id === sentMessage.id)) return prev;
          return [...prev, sentMessage];
        });

        setTimeout(scrollToBottom, 100);

        // Update conversation list (last message / ordering)
        fetchConversations();
      } else {
        // send failed — restore the text so the user doesn't lose it
        setNewMessage(textToSend);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(textToSend);
    }
  };

  const markMessagesAsRead = async (conversationId: number) => {
    try {
      await fetch(`http://localhost:8080/api/chat/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Reads from refs instead of closed-over state, so it always sees
  // the conversation the user currently has open, even though this
  // function was registered once inside the socket-connect effect.
  const handleNewMessage = (message: Message) => {
    const active = currentConversationRef.current;

    if (active && message.conversationId === active.id) {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev; // avoid dupes
        return [...prev, message];
      });
      setTimeout(scrollToBottom, 100);

      // If the incoming message is in the open conversation, mark it read
      // right away since the user is actively viewing it.
      markMessagesAsRead(active.id);
    }

    // Always refresh the sidebar (last message preview, unread counts, ordering)
    fetchConversations();
  };

  const handleReadReceipt = (conversationId: number) => {
    const active = currentConversationRef.current;
    const myId = userIdRef.current;

    if (active && conversationId === active.id) {
      setMessages(prev =>
        prev.map(msg =>
          msg.senderId === myId ? { ...msg, isRead: true } : msg
        )
      );
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Messages</h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No messages yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Start a new conversation</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setCurrentConversation(conv)}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition border-l-4 ${currentConversation?.id === conv.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-transparent'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                        {conv.otherUserName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {conv.otherUserName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    {conv.lastMessageTime && (
                      <span className="text-xs text-gray-400 dark:text-gray-400">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                  {currentConversation.otherUserName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {currentConversation.otherUserName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No messages yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === userId;
                  const showDate = index === 0 ||
                    new Date(msg.createdAt).toDateString() !==
                    new Date(messages[index - 1].createdAt).toDateString();

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center">
                          <span className="text-xs text-gray-400 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div className={`rounded-2xl px-4 py-2 ${isOwn
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                            }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-400 ${isOwn ? 'justify-end' : 'justify-start'
                            }`}>
                            <span>{formatTime(msg.createdAt)}</span>
                            {isOwn && (
                              msg.isRead ? (
                                <CheckCheck className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Check className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                />
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] max-h-[120px] dark:text-gray-100 dark:placeholder-gray-500"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Welcome to Messages</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
              Select a conversation from the sidebar or start a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}