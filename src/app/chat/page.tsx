// app/chat/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic';
import HomeHeader from "../home/HomeHeader";
import Footer from "../component/Footer";

// Dynamically import ChatInterface to avoid SSR issues with WebSocket
const ChatInterface = dynamic(
  () => import('@/app/component/chat/ChatInterface'),
  { ssr: false, loading: () => <ChatLoading /> }
);

function ChatLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading chat...</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialConversationId, setInitialConversationId] = useState<number | undefined>();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    // 🔍 DEBUG LOG 1 — what's actually in localStorage
    console.log('🔍 [ChatPage] raw localStorage:', { accessToken, userStr });

    if (!accessToken) {
      console.log('🔍 [ChatPage] No accessToken found — redirecting to /signin');
      router.push('/signin');
      return;
    }

    setToken(accessToken);

    // Get conversation ID from URL if present
    const convId = searchParams.get('conversationId');
    if (convId) {
      setInitialConversationId(parseInt(convId));
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('🔍 [ChatPage] parsed user object:', user);
        const resolvedId = user.id || user.userId;
        console.log('🔍 [ChatPage] resolved userId:', resolvedId);
        setUserId(resolvedId);
      } catch (error) {
        console.error('🔍 [ChatPage] Error parsing user data:', error);
        router.push('/signin');
      }
    } else {
      console.log('🔍 [ChatPage] No "user" key found in localStorage at all');
    }

    setLoading(false);
  }, [router, searchParams]);

  // 🔍 DEBUG LOG 2 — state right before the render guard
  console.log('🔍 [ChatPage] render state:', { userId, token, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <ChatLoading />
        </div>
        <Footer />
      </div>
    );
  }

  if (!userId || !token) {
    console.log('🔍 [ChatPage] BLOCKED — userId or token missing, rendering null', { userId, token });
    return null;
  }

  console.log('🔍 [ChatPage] Rendering <ChatInterface /> with', { userId, token });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <HomeHeader />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        <ChatInterface
          userId={userId}
          token={token}
          initialConversationId={initialConversationId}
        />
      </div>
      <Footer />
    </div>
  );
}