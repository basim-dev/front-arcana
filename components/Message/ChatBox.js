import { useEffect, useRef, useState } from "react";
import { Send, Clock, Trash2, CheckCircle, X, ChevronLeft } from "lucide-react";
import { useRouter } from "next/router";

const ChatBox = ({ currentUserId, targetUserId, targetUser, onCloseChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const router = useRouter();

  const handleNavigateToUserProfile = (userId) => {
    if (!userId) return;
    router.push(`/userProfile/${userId}`);
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `https://back-arcana.vercel.app/messages/${currentUserId}/${targetUserId}`
      );
      const data = await res.json();
      setMessages(data);

      await fetch(
        `https://back-arcana.vercel.app/messages/${currentUserId}/${targetUserId}/mark-read`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Error while fetching messages:", err);
    }
  };

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    setIsSending(true);

    try {
      await fetch("https://back-arcana.vercel.app/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: targetUserId,
          content: trimmed,
        }),
      });

      setNewMessage("");
      await fetchMessages();
      setIsSending(false);
    } catch (err) {
      console.error("Error while sending message:", err);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      await fetch(
        `https://back-arcana.vercel.app/messages/${selectedMessage._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
          }),
        }
      );

      setMessages(messages.filter((msg) => msg._id !== selectedMessage._id));
      setIsDeleteModalOpen(false);
      setSelectedMessage(null);
    } catch (err) {
      console.error("Error while deleting message:", err);
    }
  };

  const confirmDeleteMessage = (message, e) => {
    e.stopPropagation();
    setSelectedMessage(message);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    if (currentUserId && targetUserId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUserId, targetUserId]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex flex-col h-full bg-arcanaBackgroundDarker backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <ChevronLeft
                className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer"
                onClick={onCloseChat}
              />
            </div>
            <div
              className="relative cursor-pointer"
              onClick={() => handleNavigateToUserProfile(targetUserId)}
            >
              <img
                src={
                  !targetUser.avatar ||
                  targetUser.avatar.includes("default-avatar.png")
                    ? "/assets/default-avatar.png"
                    : targetUser.avatar
                }
                alt={targetUser.username}
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-arcanaBackgroundDarker"></div>
            </div>
            <div
              onClick={() => handleNavigateToUserProfile(targetUserId)}
              className="cursor-pointer"
            >
              <div className="font-semibold text-white">
                {targetUser.username}
              </div>
            </div>
          </div>

          <button
            onClick={onCloseChat}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 bg-gradient-to-b from-arcanaBackgroundDarker to-arcanaBackgroundLighter"
        style={{
          height: "calc(100% - 130px)",
          maxHeight: "calc(100% - 130px)",
          overflowY: "auto",
          scrollbarWidth: "thin",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-8">
            <p className="mb-2">Aucun message</p>
            <p className="text-sm">
              Commencez à discuter avec {targetUser.username}
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSender = msg.sender === currentUserId;
            const showDate =
              index === 0 ||
              new Date(msg.createdAt).toDateString() !==
                new Date(messages[index - 1]?.createdAt).toDateString();

            return (
              <div key={msg._id} className="space-y-1">
                {showDate && (
                  <div className="flex justify-center my-4">
                    <div className="px-4 py-1 rounded-full bg-white/10 text-xs text-gray-300">
                      {formatDate(msg.createdAt)}
                    </div>
                  </div>
                )}
                <div
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  } group`}
                >
                  <div
                    className={`max-w-[75%] flex flex-col ${
                      isSender ? "items-end" : "items-start"
                    } relative`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm ${
                        isSender
                          ? "bg-arcanaBlue text-arcanaBackgroundDarker"
                          : "bg-arcanaBackgroundDarker/80 text-gray-200 border border-white/10"
                      } relative group`}
                    >
                      <div className="pr-5">{msg.content}</div>

                      {isSender && (
                        <button
                          onClick={(e) => confirmDeleteMessage(msg, e)}
                          className="absolute right-2 top-2 p-1 rounded-full bg-arcanaBackgroundDarker/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-arcanaBackgroundDarker/40"
                          aria-label="Supprimer le message"
                        >
                          <Trash2 className="w-3 h-3 text-arcanaBackgroundDarker" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-400 mt-1 px-2">
                      <span>{formatTime(msg.createdAt)}</span>
                      {isSender && msg.read && (
                        <CheckCircle className="ml-1 w-3 h-3 text-arcanaBlue" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-arcanaBackgroundLighter text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-1 focus:ring-arcanaBlue resize-none min-h-[46px]"
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              placeholder="Écrivez votre message..."
              rows={1}
              style={{ maxHeight: "120px", overflowY: "auto" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
            className={`p-3 rounded-xl transition-all duration-200 ${
              !newMessage.trim() || isSending
                ? "bg-arcanaBackgroundLighter text-gray-500 cursor-not-allowed"
                : "bg-arcanaBlue text-arcanaBackgroundDarker hover:bg-arcanaBlue/90"
            }`}
          >
            {isSending ? (
              <Clock className="w-5 h-5 animate-pulse" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-arcanaBackgroundDarker rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Supprimer le message
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action ne
              peut pas être annulée.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteMessage}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
