import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import ConversationList from "../Message/ConversationList";
import ChatBox from "../Message/ChatBox";
import GrainOverlay from "../GrainOverlay";
import { MessageSquare, ArrowLeft, Bell } from "lucide-react";

const MessagesPage = () => {
  const router = useRouter();
  const { selectedUserId } = router.query;
  const currentUserId = useSelector((state) => state.user.value.userId);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const checkUnreadMessages = async () => {
      try {
        const res = await fetch(
          `https://back-arcana.vercel.app/messages/${currentUserId}/unread/total`
        );
        const { total } = await res.json();
        setTotalUnread(total);
      } catch (err) {
        console.error(
          "Erreur lors de la vérification des messages non lus:",
          err
        );
      }
    };

    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 10000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  useEffect(() => {
    if (selectedUserId && currentUserId) {
      const fetchSelectedUser = async () => {
        try {
          const response = await fetch(
            `https://back-arcana.vercel.app/users/${selectedUserId}`
          );
          const data = await response.json();

          if (data.result && data.user) {
            setSelectedUser({
              _id: selectedUserId,
              username: data.user.username,
              avatar: data.user.avatar || "/assets/default-avatar.png",
            });

            if (isMobile) {
              setShowMobileChat(true);
            }
          }
        } catch (error) {
          console.error("Error fetching selected user:", error);
        }
      };

      fetchSelectedUser();
    }
  }, [selectedUserId, currentUserId, isMobile]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) {
      setShowMobileChat(true);
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    if (isMobile) {
      setShowMobileChat(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-arcanaBlue rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GrainOverlay />

      <div className="flex flex-col min-h-screen max-h-screen bg-gradient-to-t from-arcanaBackgroundDarker to-arcanaBackgroundLighter cursor-default overflow-hidden">
        <div className="flex flex-1">
          {/* Left Sidebar - Hidden on mobile */}
          <aside className="hidden md:block w-1/6 p-4"></aside>

          {/* Main Content */}
          <main className="w-full md:w-4/6 max-w-[1200px] mx-auto flex flex-col py-4 md:py-16 px-4 md:px-0 font-jakarta">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center">
                {isMobile && showMobileChat ? (
                  <button
                    onClick={handleBackToList}
                    className="mr-2 p-2 rounded-full hover:bg-white/5"
                  >
                    <ArrowLeft className="w-6 h-6 text-arcanaBlue" />
                  </button>
                ) : (
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-arcanaBlue mr-3" />
                )}
                <h1 className="text-lg md:text-2xl font-semibold text-white tracking-tight">
                  {isMobile && showMobileChat && selectedUser
                    ? selectedUser.username
                    : "Messagerie"}
                </h1>
              </div>

              {totalUnread > 0 && !showMobileChat && (
                <div className="bg-arcanaBlue text-arcanaBackgroundDarker px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Bell className="w-4 h-4 mr-1" />
                  {totalUnread}
                </div>
              )}
            </div>

            <div
              className="flex flex-col md:flex-row md:space-x-6"
              style={{ height: "calc(100vh - 120px)" }}
            >
              <div
                className={`${
                  isMobile && showMobileChat ? "hidden" : "block"
                } w-full md:w-1/3 h-full`}
              >
                <ConversationList
                  currentUserId={currentUserId}
                  onSelectUser={handleSelectUser}
                  selectedUser={selectedUser}
                />
              </div>

              <div
                className={`${
                  isMobile && !showMobileChat ? "hidden" : "block"
                } flex-1 h-full`}
              >
                {selectedUser ? (
                  <ChatBox
                    currentUserId={currentUserId}
                    targetUserId={selectedUser._id}
                    targetUser={selectedUser}
                    onCloseChat={handleCloseChat}
                  />
                ) : (
                  <div className="hidden md:flex flex-col items-center justify-center h-full bg-arcanaBackgroundDarker backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                    <MessageSquare className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-lg text-white font-semibold mb-2">
                      Aucune conversation sélectionnée
                    </p>
                    <p className="text-gray-400 text-center max-w-md">
                      Sélectionnez une conversation dans la liste ou
                      commencez-en une nouvelle
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>

          <aside className="hidden md:block w-1/6 p-4"></aside>
        </div>
      </div>
    </>
  );
};

export default MessagesPage;
