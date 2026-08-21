import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  CheckCheck,
  Briefcase,
  Image,
  Sparkles
} from 'lucide-react';

export function MessagesPage() {
  const { currentUser } = useAuth();
  const { conversations, sendMessage } = useMarketplace();

  const [activeConversationId, setActiveConversationId] = useState(conversations[0]?.id || 'conv-1');
  const [inputText, setInputText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const filteredConversations = conversations.filter(c => {
    if (searchContact.trim()) {
      return c.participantName.toLowerCase().includes(searchContact.toLowerCase());
    }
    return true;
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(activeConv.id, {
      senderId: currentUser?.id || 'usr-current',
      senderName: currentUser?.name || 'You',
      text: inputText.trim()
    });

    setInputText('');
  };

  const handleQuickPrompt = (promptText) => {
    sendMessage(activeConv.id, {
      senderId: currentUser?.id || 'usr-current',
      senderName: currentUser?.name || 'You',
      text: promptText
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-soft overflow-hidden flex min-h-0">
        {/* Left Pane: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Messages</h2>
              <Badge variant="primary" size="sm">{conversations.length} Active</Badge>
            </div>
            <SearchBar
              value={searchContact}
              onChange={setSearchContact}
              placeholder="Search conversations..."
              size="sm"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConv?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setShowMobileChat(true);
                  }}
                  className={`p-4 flex items-start gap-3.5 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-primary-50/60 dark:bg-primary-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <Avatar
                    src={conv.participantAvatar}
                    name={conv.participantName}
                    size="md"
                    isOnline={conv.isOnline}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {conv.participantName}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {conv.lastMessage}
                    </p>

                    {conv.projectContext && (
                      <span className="inline-block mt-1.5 text-[10px] font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-md truncate max-w-full">
                        {conv.projectContext.title}
                      </span>
                    )}
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/50 ${
            showMobileChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Chat Top Header */}
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <Avatar
                    src={activeConv.participantAvatar}
                    name={activeConv.participantName}
                    size="md"
                    isOnline={activeConv.isOnline}
                  />

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{activeConv.participantName}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        ({activeConv.isOnline ? 'Online now' : 'Offline'})
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {activeConv.participantTitle || 'Collaborator'}
                    </p>
                  </div>
                </div>

                {activeConv.projectContext && (
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {activeConv.projectContext.title}
                    </span>
                    <Badge variant="primary" size="sm">{activeConv.projectContext.budget}</Badge>
                  </div>
                )}
              </div>

              {/* Message Thread */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {activeConv.messages?.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id || msg.senderId === 'usr-client-1' || msg.senderId === 'usr-current';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md sm:max-w-lg rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {msg.attachment && (
                          <div className={`mt-2 p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                            isMe ? 'bg-primary-700/60 border-primary-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}>
                            <Image className="w-4 h-4" />
                            <span className="font-semibold truncate">{msg.attachment.name}</span>
                            <span className="text-[10px] opacity-75">({msg.attachment.size})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 px-1">
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-primary-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-4 py-2 bg-white/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Quick Reply:</span>
                {[
                  'Sounds great! I will review this shortly.',
                  'Can you share the Figma prototype link?',
                  'Milestone looks good, funding escrow now.'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-slate-600 dark:text-slate-300 hover:text-primary-600 text-[11px] whitespace-nowrap transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSend}
                className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
              >
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />

                <Button type="submit" variant="primary" size="md" icon={Send} disabled={!inputText.trim()}>
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
