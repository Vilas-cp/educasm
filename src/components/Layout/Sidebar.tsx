import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { SearchBar } from '../shared/SearchBar';
import { GPTService } from '../../services/gptService';
import { MarkdownComponentProps } from '../../types';
import { RelatedTopics } from '../Explore/RelatedTopics';
import { RelatedQuestions } from '../Explore/RelatedQuestions';
import { LoadingAnimation } from '../shared/LoadingAnimation';
import { UserContext } from '../../types';

interface Message {
  type: 'user' | 'ai';
  content?: string;
  topics?: Array<{
    topic: string;
    type: string;
    reason: string;
  }>;
  questions?: Array<{
    question: string;
    type: string;
    context: string;
  }>;
}

export interface StreamChunk {
  text: string;
  topics: any[];
  questions: any[];
}

interface ChatSession {
  id: string;
  timestamp: number;
  messages: Message[];
  initialQuery: string;
}

interface ExploreViewProps {
  initialQuery?: string;
  onError: (message: string) => void;
  onRelatedQueryClick?: (query: string) => void;
  userContext: UserContext;
}

const MarkdownComponents: Record<string, React.FC<MarkdownComponentProps>> = {
  h1: ({ children, ...props }) => (
    <h1 className="text-xl sm:text-2xl font-bold text-gray-100 mt-4 mb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mt-3 mb-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-base sm:text-lg font-medium text-gray-200 mt-2 mb-1" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-sm sm:text-base text-gray-300 my-1.5 leading-relaxed break-words" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside my-2 text-gray-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside my-2 text-gray-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="my-1 text-gray-300" {...props}>
      {children}
    </li>
  ),
  code: ({ children, inline, ...props }) => (
    inline ? 
      <code className="bg-gray-700 px-1 rounded text-xs sm:text-sm" {...props}>{children}</code> :
      <code className="block bg-gray-700 p-2 rounded my-2 text-xs sm:text-sm overflow-x-auto" {...props}>
        {children}
      </code>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-gray-500 pl-4 my-2 text-gray-400 italic" {...props}>
      {children}
    </blockquote>
  ),
};

export const ExploreView: React.FC<ExploreViewProps> = ({ 
  initialQuery, 
  onError,
  onRelatedQueryClick,
  userContext
}) => {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showInitialSearch, setShowInitialSearch] = useState(!initialQuery);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gptService = useMemo(() => new GPTService(), []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToTop();
    }
  }, [messages.length, scrollToTop]);

  useEffect(() => {
    const handleReset = () => {
      setMessages([]);
      setChatHistory([]);
      setCurrentSessionId('');
      setShowInitialSearch(true);
    };

    window.addEventListener('resetExplore', handleReset);
    return () => window.removeEventListener('resetExplore', handleReset);
  }, []);

  const createNewSession = useCallback((query: string) => {
    const sessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: sessionId,
      timestamp: Date.now(),
      messages: [],
      initialQuery: query
    };
    
    setChatHistory(prev => [newSession, ...prev]);
    setCurrentSessionId(sessionId);
    return sessionId;
  }, []);

  const updateSessionMessages = useCallback((sessionId: string, newMessages: Message[]) => {
    setChatHistory(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: newMessages }
        : session
    ));
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    try {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

      scrollToTop();
      const sessionId = createNewSession(query);
      setIsLoading(true);
      setShowInitialSearch(false);
      
      const initialMessages = [
        { type: 'user' as const, content: query },
        { type: 'ai' as const, content: '' }
      ];
      
      setMessages(initialMessages);
      updateSessionMessages(sessionId, initialMessages);

      await gptService.streamExploreContent(
        query,
        userContext,
        (chunk: StreamChunk) => {
          const updatedMessages = [
            { type: 'user' as const, content: query },
            {
              type: 'ai' as const,
              content: chunk.text,
              topics: chunk.topics,
              questions: chunk.questions
            }
          ];
          setMessages(updatedMessages);
          updateSessionMessages(sessionId, updatedMessages);
        }
      );
    } catch (error) {
      console.error('Search error:', error);
      onError(error instanceof Error ? error.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, [gptService, onError, userContext, createNewSession, updateSessionMessages, scrollToTop]);

  const loadSession = useCallback((sessionId: string) => {
    const session = chatHistory.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowInitialSearch(false);
      setIsHistoryOpen(false);
      scrollToTop();
    }
  }, [chatHistory, scrollToTop]);

  const handleRelatedQueryClick = useCallback((query: string) => {
    scrollToTop();
    if (onRelatedQueryClick) {
      onRelatedQueryClick(query);
    }
    handleSearch(query);
  }, [handleSearch, onRelatedQueryClick, scrollToTop]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col" ref={containerRef}>
      {/* History Toggle Button */}
      <button
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        className="fixed right-4 top-4 z-50 p-2 rounded-lg bg-gray-800/80 
          hover:bg-gray-700/80 border border-gray-700/50 backdrop-blur-sm
          transition-colors"
      >
        <svg 
          className="w-5 h-5 text-gray-300"
          fill="none" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Chat History Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-72 bg-gray-900 border-l border-gray-700/50 
          transform transition-transform duration-300 z-40 
          ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Chat History</h3>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="text-gray-400 hover:text-gray-200 text-xl font-medium"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {chatHistory.map(session => (
              <button
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors
                  ${session.id === currentSessionId 
                    ? 'bg-gray-700/50 text-gray-100' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/30'}`}
              >
                <div className="text-sm font-medium truncate">
                  {session.initialQuery}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(session.timestamp).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showInitialSearch ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            What do you want to explore?
          </h1>
          
          <div className="w-full max-w-xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Enter what you want to explore..."
              centered={true}
              className="bg-gray-900/80"
            />
            
            <p className="text-sm text-gray-400 text-center mt-1">Press Enter to search</p>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <span className="text-sm text-gray-400">Try:</span>
              <button
                onClick={() => handleSearch("Quantum Physics")}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 
                  border border-purple-500/30 transition-colors text-xs sm:text-sm text-purple-300"
              >
                ⚛️ Quantum Physics
              </button>
              <button
                onClick={() => handleSearch("Machine Learning")}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 
                  border border-blue-500/30 transition-colors text-xs sm:text-sm text-blue-300"
              >
                🤖 Machine Learning
              </button>
              <button
                onClick={() => handleSearch("World History")}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 
                  border border-green-500/30 transition-colors text-xs sm:text-sm text-green-300"
              >
                🌍 World History
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div ref={messagesContainerRef} className="relative flex flex-col w-full">
          <div className="space-y-2 pb-16">
            {messages.map((message, index) => (
              <div key={index} className="px-2 sm:px-4 w-full mx-auto">
                <div className="max-w-3xl mx-auto">
                  {message.type === "user" ? (
                    <div className="w-full">
                      <div className="flex-1 text-base sm:text-lg font-semibold text-gray-100">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="flex-1 min-w-0">
                        {!message.content && isLoading ? (
                          <div className="flex items-center space-x-2 py-2">
                            <LoadingAnimation />
                            <span className="text-sm text-gray-400">Thinking...</span>
                          </div>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={MarkdownComponents}
                            className="whitespace-pre-wrap break-words space-y-1.5"
                          >
                            {message.content || ""}
                          </ReactMarkdown>
                        )}

                        {message.topics && message.topics.length > 0 && (
                          <div className="mt-3">
                            <RelatedTopics
                              topics={message.topics}
                              onTopicClick={handleRelatedQueryClick}
                            />
                          </div>
                        )}

                        {message.questions && message.questions.length > 0 && (
                          <div className="mt-3">
                            <RelatedQuestions
                              questions={message.questions}
                              onQuestionClick={handleRelatedQueryClick}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div 
              ref={messagesEndRef}
              className="h-8 w-full"
              aria-hidden="true"
            />
          </div>

          <div className="fixed bottom-12 left-0 right-0 bg-gradient-to-t from-background 
            via-background to-transparent pb-1 pt-2 z-30">
            <div className="w-full px-2 sm:px-4 max-w-3xl mx-auto">
              <SearchBar
                onSearch={handleSearch} 
                placeholder="Ask a follow-up question..."
                centered={false}
                className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 h-10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Overlay for chat history sidebar */}
      {isHistoryOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
};

// Export Components
export const RelatedQueries: React.FC<{
  queries: Array<{
    query: string;
    type: string;
    context: string;
  }>;
  onQueryClick: (query: string) => void;
}> = ({ queries, onQueryClick }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'curiosity': return 'bg-blue-500/20 text-blue-400';
      case 'mechanism': return 'bg-green-500/20 text-green-400';
      case 'causality': return 'bg-yellow-500/20 text-yellow-400';
      case 'innovation': return 'bg-purple-500/20 text-purple-400';
      case 'insight': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="mt-6 pt-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3 px-2">
        Follow-up Questions
      </h3>
      <div className="rounded-lg bg-gray-800/50 divide-y divide-gray-700/50">
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => onQueryClick(query.query)}
            className="w-full text-left hover:bg-gray-700/30 transition-all 
              duration-200 group first:rounded-t-lg last:rounded-b-lg"
          >
            <div className="py-3 px-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-200 group-hover:text-primary 
                      transition-colors line-clamp-2">
                      {query.query}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full 
                      font-medium ${getTypeColor(query.type)}`}>
                      {query.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {query.context}
                  </p>
                </div>
                <span className="text-gray-400 group-hover:text-primary 
                  transition-colors text-lg">
                  →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Add display name
ExploreView.displayName = 'ExploreView';