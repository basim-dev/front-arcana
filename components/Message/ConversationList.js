import { useEffect, useState } from "react";
import { MessageSquare, PlusCircle, Search, Trash2, Bell } from "lucide-react";

const ConversationList = ({ currentUserId, onSelectUser, selectedUser }) => {
  const [conversations, setConversations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // Fetch conversations and sort by most recent message
  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `https://back-arcana.vercel.app/messages/conversations/${currentUserId}`
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        // Fetch last message timestamp for each conversation to sort them
        const conversationsWithTimestamp = await Promise.all(
          data.map(async (user) => {
            const msgRes = await fetch(
              `https://back-arcana.vercel.app/messages/${currentUserId}/${user._id}/last`
            );
            const lastMsg = await msgRes.json();
            return {
              ...user,
              lastMessageAt: lastMsg
                ? new Date(lastMsg.createdAt)
                : new Date(0),
              hasUnread: lastMsg
                ? lastMsg.sender !== currentUserId && !lastMsg.read
                : false,
            };
          })
        );

        // Sort conversations by most recent message
        const sortedConversations = conversationsWithTimestamp.sort(
          (a, b) => b.lastMessageAt - a.lastMessageAt
        );

        setConversations(sortedConversations);

        // Update unread messages counter
        const unreadCount = {};
        for (const conv of sortedConversations) {
          if (conv.hasUnread) {
            const countRes = await fetch(
              `https://back-arcana.vercel.app/messages/${currentUserId}/${conv._id}/unread/count`
            );
            const { count } = await countRes.json();
            if (count > 0) {
              unreadCount[conv._id] = count;
            }
          }
        }
        setUnreadMessages(unreadCount);
      } else {
        console.warn("Unexpected response:", data);
        setConversations([]);
      }
    } catch (err) {
      console.error("Error while fetching conversations:", err);
      setConversations([]);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();

      // Poll for new messages and updates every 5 seconds
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedUser && selectedUser._id && unreadMessages[selectedUser._id]) {
      markConversationAsRead(selectedUser._id);
    }
  }, [selectedUser]);

  const markConversationAsRead = async (userId) => {
    try {
      await fetch(
        `https://back-arcana.vercel.app/messages/${currentUserId}/${userId}/mark-read`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      // Update local state
      setUnreadMessages((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const handleSearch = async (query) => {
    try {
      const res = await fetch(
        `https://back-arcana.vercel.app/search?q=${query}`
      );
      const data = await res.json();
      if (data.result && Array.isArray(data.users)) {
        setSearchResults(data.users.filter((u) => u._id !== currentUserId));
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("User search failed:", err);
    }
  };

  const handleStartConversation = async (targetUserId) => {
    try {
      const res = await fetch(
        `https://back-arcana.vercel.app/messages/start-conversation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId1: currentUserId,
            userId2: targetUserId,
          }),
        }
      );

      const user = await res.json();
      if (user && user._id) {
        const alreadyExists = conversations.find((c) => c._id === user._id);
        if (!alreadyExists) {
          setConversations((prev) => [user, ...prev]);
        }
        onSelectUser(user);
        setIsModalOpen(false);
        setSearchInput("");
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Could not start conversation:", err);
    }
  };

  // Display delete confirmation
  const confirmDeleteConversation = (user, e) => {
    e.stopPropagation();
    setConversationToDelete(user);
    setDeleteModalOpen(true);
  };

  // Delete conversation
  const deleteConversation = async () => {
    try {
      if (!conversationToDelete) return;

      await fetch(
        `https://back-arcana.vercel.app/messages/conversation/${currentUserId}/${conversationToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      // Update local state
      setConversations((prev) =>
        prev.filter((c) => c._id !== conversationToDelete._id)
      );

      // If the deleted conversation was selected, clear the selection
      if (selectedUser && selectedUser._id === conversationToDelete._id) {
        onSelectUser(null);
      }

      setDeleteModalOpen(false);
      setConversationToDelete(null);
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-arcanaBackgroundDarker p-6 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
      {/* Header - fixed height */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 text-arcanaBlue mr-3" />
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Conversations
          </h2>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition bg-arcanaBlue text-arcanaBackgroundDarker hover:bg-arcanaBlue/90"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="w-4 h-4" />
          Nouveau
        </button>
      </div>

      {/* Conversations list - scrollable */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ height: "calc(100% - 48px)" }}
      >
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
            <MessageSquare className="w-12 h-12 text-white/30 mb-4" />
            <p className="text-gray-300 text-sm">
              Aucune conversation pour l'instant.
            </p>
            <button
              className="mt-4 text-arcanaBlue text-sm hover:underline"
              onClick={() => setIsModalOpen(true)}
            >
              Commencer une conversation
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((user) => (
              <div
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={`cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                  selectedUser?._id === user._id
                    ? "bg-arcanaBlue text-arcanaBackgroundDarker"
                    : "hover:bg-white/5 text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        !user.avatar ||
                        user.avatar.includes("default-avatar.png")
                          ? "/assets/default-avatar.png"
                          : user.avatar
                      }
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-arcanaBackgroundDarker"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm flex justify-between items-center">
                      <span>{user.username}</span>

                      {/* Unread message badge */}
                      {unreadMessages[user._id] && (
                        <span className="bg-arcanaBlue text-arcanaBackgroundDarker text-xs font-medium px-2 py-0.5 rounded-full ml-2">
                          {unreadMessages[user._id]}
                        </span>
                      )}
                    </div>
                    {user.lastMessageAt && user.lastMessageAt.getTime() > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {user.lastMessageAt.toLocaleDateString([], {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </div>
                    )}
                  </div>

                  {/* Delete conversation button */}
                  {selectedUser?._id !== user._id && (
                    <button
                      onClick={(e) => confirmDeleteConversation(user, e)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-arcanaBackgroundDarker rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Nouvelle conversation
            </h3>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full border border-white/10 bg-arcanaBackgroundLighter rounded-lg px-10 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-arcanaBlue"
              />
            </div>

            {searchResults.length > 0 ? (
              <ul className="space-y-1 max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <li
                    key={user._id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-arcanaBackgroundLighter p-3 rounded-lg transition-all"
                    onClick={() => handleStartConversation(user._id)}
                  >
                    <img
                      src={
                        !user.avatar ||
                        user.avatar.includes("default-avatar.png")
                          ? "/assets/default-avatar.png"
                          : user.avatar
                      }
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                    <span className="text-sm text-white">{user.username}</span>
                  </li>
                ))}
              </ul>
            ) : (
              searchInput && (
                <p className="text-sm text-gray-400 py-4 text-center">
                  Aucun utilisateur trouvé.
                </p>
              )
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-arcanaBackgroundDarker rounded-xl border border-white/10 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Supprimer la conversation
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Êtes-vous sûr de vouloir supprimer la conversation avec{" "}
              {conversationToDelete?.username} ? Cette action ne peut pas être
              annulée.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition"
              >
                Annuler
              </button>
              <button
                onClick={deleteConversation}
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

export default ConversationList;
