import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AgentBlock {
  agentName: string;
  content: string;
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  agentCalls?: AgentCall[];
  currentAgent?: string;
  agentBlocks?: AgentBlock[];
  attachments?: FileAttachment[];
  timestamp: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  status: 'pending' | 'completed' | 'error';
  timestamp?: number;
}

export interface AgentCall {
  id: string;
  from_agent: string;
  to_agent: string;
  timestamp: number;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  backendThreadId?: string; // 后端线程ID
}

interface ChatState {
  threads: ChatThread[];
  currentThreadId: string | null;
  isLoading: boolean;
  graphId: string; // 新增 graph_id 状态
  
  // Actions
  createThread: (title?: string) => string;
  deleteThread: (threadId: string) => void;
  selectThread: (threadId: string) => void;
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (threadId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  setLoading: (loading: boolean) => void;
  setGraphId: (graphId: string) => void; // 新增设置 graph_id 的方法
  setBackendThreadId: (threadId: string, backendThreadId: string) => void; // 设置后端线程ID
  clearAllThreads: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      currentThreadId: null,
      isLoading: false,
      graphId: 'langgraph-app', // 默认 graph_id

      createThread: (title = 'New Chat') => {
        const newThread: ChatThread = {
          id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          threads: [newThread, ...state.threads],
          currentThreadId: newThread.id,
        }));

        return newThread.id;
      },

      deleteThread: (threadId: string) => {
        set((state) => {
          const newThreads = state.threads.filter(t => t.id !== threadId);
          const newCurrentThreadId = 
            state.currentThreadId === threadId 
              ? (newThreads.length > 0 ? newThreads[0].id : null)
              : state.currentThreadId;
          
          return {
            threads: newThreads,
            currentThreadId: newCurrentThreadId,
          };
        });
      },

      selectThread: (threadId: string) => {
        set({ currentThreadId: threadId });
      },

      addMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        set((state) => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [...thread.messages, newMessage],
                  updatedAt: Date.now(),
                  title: thread.messages.length === 0 ? 
                    message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '') : 
                    thread.title
                }
              : thread
          ),
        }));
      },

      updateMessage: (threadId: string, messageId: string, updates: Partial<ChatMessage>) => {
        set((state) => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: thread.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : thread
          ),
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setGraphId: (graphId: string) => {
        set({ graphId });
      },

      setBackendThreadId: (threadId: string, backendThreadId: string) => {
        set((state) => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? { ...thread, backendThreadId }
              : thread
          ),
        }));
      },

      clearAllThreads: () => {
        set({ threads: [], currentThreadId: null });
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        threads: state.threads,
        currentThreadId: state.currentThreadId,
      }),
    }
  )
);

// Helper function to get current thread
export const useCurrentThread = () => {
  const { threads, currentThreadId } = useChatStore();
  return threads.find(t => t.id === currentThreadId) || null;
};