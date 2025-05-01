import React, { useState } from "react";

const MessageModal = ({ isOpen, onClose, onSendMessage, recipientName }) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-arcanaBackgroundDarker rounded-xl border border-white/10 p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          <svg
            className="w-5 h-5 text-arcanaBlue mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Envoyer un message à {recipientName}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="w-full bg-arcanaBackgroundLighter border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-arcanaBlue"
              placeholder="Écrivez votre message ici..."
              autoFocus
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition"
              disabled={isSending}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-medium bg-arcanaBlue text-arcanaBackgroundDarker hover:bg-arcanaBlue/90 transition flex items-center"
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-arcanaBackgroundDarker rounded-full animate-spin mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;
