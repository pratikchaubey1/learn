import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import LatexRenderer from './common/LatexRenderer';
import { getAiceyResponse } from '../services/geminiService';

interface AiceyChatProps {
  onClose: () => void;
  initialContext?: string;
}

const AiceyChat: React.FC<AiceyChatProps> = ({ onClose, initialContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
      const fetchInitialMessage = async () => {
        setIsLoading(true);
        const initialHistory: ChatMessage[] = [];
        const greeting: ChatMessage = { role: 'model', content: '' };
        setMessages([greeting]);
        
        try {
            // Enhanced system context for more flexible and comprehensive responses
            const systemContext = `You are Aicey, an educational assistant. Follow these guidelines:
            1. Provide detailed answers when the user needs in-depth explanations
            2. Keep responses concise for simple questions
            3. Use markdown formatting: **bold** for key points, *italics* for emphasis
            4. Always maintain a friendly, educational tone
            5. Include relevant examples when helpful
            6. Structure complex answers with clear sections
            Adapt your response length and depth based on the user's question complexity.`;

            const mergedContext = [initialContext, systemContext].filter(Boolean).join('\n');
            const stream = await getAiceyResponse(initialHistory, mergedContext);
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const json = JSON.parse(line.substring(6));
                            if (json.textChunk) {
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1].content += json.textChunk;
                                    return updated;
                                });
                            }
                            if (json.error) throw new Error(json.error);
                        } catch (e) {
                            console.error("Failed to parse SSE line:", line);
                        }
                    }
                }
            }
        } catch (error) {
            setMessages([{ role: 'model', content: "Sorry, I couldn't connect right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
      };

      fetchInitialMessage();
  }, [initialContext]);

  useEffect(scrollToBottom, [messages]);

  const processContentForDisplay = (content: string) => {
    if (!content) return '';
    // Normalize and trim excessive whitespace
    let out = content.trim();
    // Simple markdown -> allowed HTML tags
    out = out
      .replace(/\*\*\*(.*?)\*\*\*/gs, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/gs, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gs, '<em>$1</em>')
      .replace(/\n{2,}/g, '<br /><br />')
      .replace(/\n/g, '<br />');
    
    return out;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
        // Use a "sliding window" of the last 12 messages to keep conversations efficient.
        const stream = await getAiceyResponse(newMessages.slice(-12), undefined);
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.substring(6));
                        if (json.textChunk) {
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1].content += json.textChunk;
                                return updated;
                            });
                        }
                        if (json.error) throw new Error(json.error);
                    } catch (e) {
                        console.error("Failed to parse SSE line:", line);
                    }
                }
            }
        }
    } catch (error) {
        const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
        setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-500 to-cyan-400 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.4 1.4L3 12l5.8 1.9a2 2 0 0 1 1.4 1.4L12 21l1.9-5.8a2 2 0 0 1 1.4-1.4L21 12l-5.8-1.9a2 2 0 0 1-1.4-1.4Z"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Aicey</h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">Brief, well-formed answers</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Close chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
          <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex-shrink-0 self-start mt-1 shadow-md"></div>}
              <div className={`max-w-xs md:max-w-md p-3 rounded-2xl break-words shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none whitespace-pre-wrap' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                 <LatexRenderer content={processContentForDisplay(msg.content)} />
                 {isLoading && msg.role === 'model' && index === messages.length - 1 && <span className="inline-block w-2 h-4 bg-slate-400 dark:bg-slate-500 ml-2 animate-pulse rounded-sm"></span>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your prep..."
              className="w-full bg-transparent p-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 text-slate-500 disabled:text-slate-300 dark:disabled:text-slate-600 hover:text-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AiceyChat;
