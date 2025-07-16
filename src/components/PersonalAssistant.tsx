
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Send } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { callPersonalAssistant } from '@/app/actions';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { ChatMessage } from '@/services/data-service';

export function PersonalAssistant() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [assistantName, setAssistantName] = useState('Aura');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Real-time chat history
  const chatQuery = (isFirebaseConfigured && db && user) 
    ? query(collection(db, 'chatHistory'), where('userId', '==', user.uid), orderBy('timestamp', 'asc')) 
    : null;
  const [chatHistorySnapshot, loadingHistory] = useCollection(chatQuery);
  const chatHistory: ChatMessage[] = chatHistorySnapshot 
    ? chatHistorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)) 
    : [];


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !user) return;

    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      await callPersonalAssistant({
        message: messageToSend,
        assistantName,
        userEmail: user.email || 'trader',
        userId: user.uid,
      });
    } catch (error) {
      console.error(error);
      // Error message is already saved to history by the server action
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="pixel-button w-full">
          <Bot size={16} /> เรียกผู้ช่วย AI ส่วนตัว
        </Button>
      </DialogTrigger>
      <DialogContent className="pixel-window !border-2 !border-primary max-w-lg h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="!text-amber-400 flex items-center gap-2">
            [ คุยกับ
            <Input
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              className="pixel-input !w-auto !inline-flex !h-8"
              placeholder="ตั้งชื่อ AI..."
            />
            ]
          </DialogTitle>
        </DialogHeader>
        <div
          ref={chatContainerRef}
          className="flex-grow mt-4 space-y-4 overflow-y-auto pr-2 bg-black/20 p-2 border border-primary/50"
        >
          {loadingHistory && <p className="text-center text-muted-foreground">กำลังโหลดประวัติการสนทนา...</p>}
          {!loadingHistory && chatHistory.map((msg) => {
            const messageText = msg.content?.[0]?.text;
            if (msg.role === 'model' && !messageText) {
                // Don't render empty model responses (likely tool calls)
                return null;
            }
            if (!messageText) return null;

            return (
                <div
                key={msg.id}
                className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
                >
                <div
                    className={`max-w-xs md:max-w-md rounded-lg px-3 py-2 ${
                    msg.role === 'user'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-primary/20 text-primary'
                    }`}
                >
                    <p className="text-base" style={{ textShadow: 'none' }}>
                    {messageText}
                    </p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                    {msg.role === 'user' ? 'คุณ' : assistantName}
                </span>
                </div>
            )
          })}
          {isLoading && (
            <div className="flex items-start">
              <div className="max-w-xs md:max-w-md rounded-lg px-3 py-2 bg-primary/20 text-primary flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <p className="text-base" style={{ textShadow: 'none' }}>
                  {assistantName} กำลังพิมพ์...
                </p>
              </div>
            </div>
          )}
        </div>
        <form
          method="POST"
          onSubmit={handleSendMessage}
          className="mt-4 flex gap-2 flex-shrink-0"
        >
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="ส่งข้อความ..."
            className="pixel-input !h-12 resize-none"
            rows={1}
            disabled={isLoading || loadingHistory}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                }
            }}
          />
          <Button type="submit" className="pixel-button !p-3" disabled={isLoading || loadingHistory || !currentMessage.trim()}>
            <Send size={20} />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
