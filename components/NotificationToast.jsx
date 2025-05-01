import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Bell } from "lucide-react";
import { showNotification, hideNotification } from "../reducers/notification";

const NotificationToast = () => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.user.value.userId);
  const { show, message } = useSelector((state) => state.notification.value);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!currentUserId) return;

    const checkUnreadMessages = async () => {
      try {
        const res = await fetch(
          `https://back-arcana.vercel.app/messages/${currentUserId}/unread/total`
        );
        const { total, lastMessage } = await res.json();

        setTotalUnread(total);

        if (lastMessage) {
          const senderRes = await fetch(
            `https://back-arcana.vercel.app/users/${lastMessage.sender}`
          );
          const sender = await senderRes.json();
          dispatch(
            showNotification(`Nouveau message de ${sender.user.username}`)
          );

          setTimeout(() => {
            dispatch(hideNotification());
          }, 5000);
        }
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
  }, [currentUserId, dispatch]);

  const closeNotification = () => {
    dispatch(hideNotification());
  };

  if (!show) return null;

  return (
    <div className="fixed top-20 right-6 z-50 bg-arcanaBlue text-arcanaBackgroundDarker rounded-lg shadow-lg p-4 flex items-center transform transition-all duration-300 animate-fade-in">
      <Bell className="w-5 h-5 mr-3" />
      <span className="font-medium">{message}</span>
      <button
        onClick={closeNotification}
        className="ml-4 p-1 hover:bg-arcanaBackgroundDarker/10 rounded-full"
      >
        &times;
      </button>
    </div>
  );
};

export default NotificationToast;
