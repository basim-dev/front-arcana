import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  X,
  Send,
  MessageSquare,
  Trash2,
  AlertCircle,
  Reply,
} from "lucide-react";
import { useRouter } from "next/router";

const API_BASE_URL = "https://back-arcana.vercel.app";

export default function CollectionComments({ collection, collectionId }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState({ id: null, isAdmin: false });
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyToReply, setReplyToReply] = useState(null);
  const [replyToReplyContent, setReplyToReplyContent] = useState("");
  const commentInputRef = useRef(null);
  const replyInputRef = useRef(null);
  const replyToReplyInputRef = useRef(null);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showAllSubReplies, setShowAllSubReplies] = useState({});

  const handleNavigateToUserProfile = (userId) => {
    if (!userId) return;
    router.push(`/userProfile/${userId}`);
  };

  // Mettre à jour le nombre de comments
  const majCommentCount = () => {
    fetch(`https://back-arcana.vercel.app/comments/collection/${collectionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          const totalCount = data.comments.reduce(
            (acc, comment) => acc + 1 + (comment.replies?.length || 0),
            0
          );
          setCommentCount(totalCount);
        }
        setIsLoading(false);
      })
      .catch((err) => console.error("Error refreshing comment count:", err));
  };

  // Récupérer les commenatires
  useEffect(() => {
    const fetchCollection = async () => {
      setIsLoading(true);
      try {
        // Récupérer le nombre de commentaires
        const commentsResponse = await fetch(
          `https://back-arcana.vercel.app/comments/collection/${collectionId}`
        );
        const commentsData = await commentsResponse.json();
        if (commentsData.result) {
          majCommentCount();
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching number of comments:", error);
        setIsLoading(false);
      }
    };

    if (collectionId) {
      fetchCollection();
    }
  }, [collectionId]);

  // Fonction memoized pour récupérer les commentaires
  const fetchComments = useCallback(async () => {
    if (!collection?._id) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(
        `${API_BASE_URL}/comments/collection/${collection._id}`
      );
      if (data.result) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des commentaires:", err);
      setError("Échec du chargement des commentaires. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [collection?.id]);

  // Récupérer les informations utilisateur
  const getUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.post(`${API_BASE_URL}/users/by-token`, {
        token,
      });

      if (data.result && data.user) {
        setUserData({
          id: data.user._id,
          isAdmin: data.user.role === "admin",
          avatar: data.user.avatar,
          username: data.user.username,
          token: token, // Store token for authenticated requests
        });
      }
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des données utilisateur:",
        err
      );
    }
  }, []);

  useEffect(() => {
    if (collection) {
      fetchComments();
      getUserData();
    }
  }, [collection, fetchComments, getUserData, replyTo]);

  // Focus on reply input when replyTo changes
  useEffect(() => {
    if (replyTo && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !userData.id || !collection?._id) return;

    try {
      setSubmitting(true);
      const { data } = await axios.post(`${API_BASE_URL}/comments`, {
        collectionId: collection._id,
        userId: userData.id,
        content: comment,
      });

      if (data.result) {
        setComment("");
        await fetchComments();
        majCommentCount();
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
      setError("Échec de l'envoi du commentaire. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();

    const targetContent = replyToReply ? replyToReplyContent : replyContent;
    const replyTargetId = replyToReply || replyTo;

    if (!targetContent.trim() || !userData.token || !replyTargetId) return;

    try {
      setSubmitting(true);

      const endpoint = `${API_BASE_URL}/comments/${replyTargetId}/reply`;

      const { data } = await axios.post(endpoint, {
        token: userData.token,
        content: targetContent,
      });

      if (data.result) {
        setReplyContent("");
        setReplyToReplyContent("");
        setReplyTo(null);
        setReplyToReply(null);
        await fetchComments();
        majCommentCount();
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de la réponse:", err);
      setError("Échec de l'envoi de la réponse. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleShowAllSubReplies = (replyId) => {
    setShowAllSubReplies((prev) => ({
      ...prev,
      [replyId]: !prev[replyId],
    }));
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce commentaire ?"))
      return;

    if (!userData.token) {
      setError("Authentification requise pour supprimer les commentaires");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.delete(
        `${API_BASE_URL}/comments/${commentId}`,
        {
          data: { token: userData.token }, // Send token in request body for DELETE
        }
      );

      if (data.result) {
        await fetchComments();
        majCommentCount();
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du commentaire:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Vous n'avez pas la permission de supprimer ce commentaire.");
      } else {
        setError("Échec de la suppression du commentaire. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const showReplyForm = (commentId) => {
    setReplyTo(commentId);
    setReplyContent("");
  };

  const cancelReply = () => {
    setReplyTo(null);
    setReplyContent("");
  };

  const showReplyToReplyForm = (replyId) => {
    setReplyToReply(replyId);
    setReplyToReplyContent("");
  };

  const cancelReplyToReply = () => {
    setReplyToReply(null);
    setReplyToReplyContent("");
  };

  console.log("comment is :", comment);

  console.log("commentS is :", comments);

  // Rendu conditionnel pour les différents états
  const renderCommentsList = () => {
    if (loading && comments.length === 0) {
      return (
        <div className="flex justify-center items-center py-6 text-gray-400">
          <div className="w-6 h-6 border-2 border-arcanaBlue border-t-transparent rounded-full animate-spin mr-2"></div>
          Chargement des commentaires...
        </div>
      );
    }

    if (error && comments.length === 0) {
      return (
        <div className="text-center py-6 text-red-400 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 mb-2" />
          <p>{error}</p>
          <button
            onClick={fetchComments}
            className="mt-2 px-4 py-2 text-sm bg-arcanaBlue/20 hover:bg-arcanaBlue/30 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-500/40" />
          <p>Aucun commentaire pour l'instant. Soyez le premier !</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id}>
            <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:border-white/20 transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                {/* Make avatar clickable */}
                <img
                  src={comment.userId?.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-white/20 object-cover cursor-pointer hover:border-arcanaBlue transition-all"
                  onError={(e) => {
                    e.target.src = "/assets/default-avatar.png";
                  }}
                  onClick={() =>
                    handleNavigateToUserProfile(comment.userId?._id)
                  }
                />
                <div className="flex-1">
                  {/* Make username clickable */}
                  <span
                    className="font-medium text-white cursor-pointer hover:text-arcanaBlue transition-colors"
                    onClick={() =>
                      handleNavigateToUserProfile(comment.userId?._id)
                    }
                  >
                    {comment.userId?.username || "Utilisateur inconnu"}
                  </span>
                  <span className="text-gray-400 text-xs ml-2">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <div className="flex items-center">
                  {userData.id && (
                    <button
                      onClick={() => showReplyForm(comment._id)}
                      className="text-gray-400 hover:text-arcanaBlue transition-colors p-1 rounded-full hover:bg-white/5 mr-1"
                      aria-label="Répondre au commentaire"
                    >
                      <Reply size={16} />
                    </button>
                  )}
                  {(userData.isAdmin ||
                    userData.id === comment.userId?._id) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/5"
                      aria-label="Supprimer le commentaire"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-200 text-sm whitespace-pre-wrap break-words pl-11">
                {comment.content}
              </p>
            </div>
            {/* Reply form */}
            {replyTo === comment._id && (
              <div className="mt-2 ml-8 border-l-2 border-arcanaBlue/30 pl-4">
                <form onSubmit={handleReply} className="flex flex-col gap-2">
                  <div className="relative">
                    <input
                      ref={replyInputRef}
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Répondre à ${comment.userId?.username}...`}
                      disabled={submitting}
                      className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200 pr-10 text-sm"
                    />
                    {replyContent.length > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {replyContent.length}/500
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={cancelReply}
                      className="px-3 py-1 text-sm rounded-lg bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={!replyContent.trim() || submitting}
                      className={`px-3 py-1 text-sm rounded-lg font-medium text-arcanaBackgroundDarker flex items-center gap-1 transition-colors ${
                        replyContent.trim() && !submitting
                          ? "bg-arcanaBlue hover:bg-arcanaBlue/90"
                          : "bg-arcanaBlue/50 cursor-not-allowed"
                      }`}
                    >
                      {submitting ? (
                        <div className="w-3 h-3 border-2 border-arcanaBackgroundDarker border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Reply size={14} />
                      )}
                      Répondre
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* Replies section */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-2 space-y-2 border-l-2 border-arcanaBlue/20 pl-4">
                {(showAllReplies
                  ? comment.replies
                  : comment.replies.slice(0, 1)
                ).map((reply) => (
                  <div
                    key={reply._id}
                    className="border border-white/5 bg-white/3 rounded-lg p-3 hover:border-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={reply.userId?.avatar}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full border border-white/20 object-cover cursor-pointer hover:border-arcanaBlue transition-all"
                        onError={(e) => {
                          e.target.src = "/assets/default-avatar.png";
                        }}
                        onClick={() =>
                          handleNavigateToUserProfile(reply.userId?._id)
                        }
                      />
                      <div className="flex-1">
                        <span
                          className="font-medium text-white text-xs cursor-pointer hover:text-arcanaBlue transition-colors"
                          onClick={() =>
                            handleNavigateToUserProfile(reply.userId?._id)
                          }
                        >
                          {reply.userId?.username || "Utilisateur inconnu"}
                        </span>
                        <span className="text-gray-400 text-xs ml-2">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {userData.id && (
                          <button
                            onClick={() => showReplyToReplyForm(reply._id)}
                            className="text-gray-400 hover:text-arcanaBlue transition-colors p-1 rounded-full hover:bg-white/5 mr-1"
                            aria-label="Répondre au commentaire"
                          >
                            <Reply size={16} />
                          </button>
                        )}
                        {(userData.isAdmin ||
                          userData.id === reply.userId?._id) && (
                          <button
                            onClick={() => handleDeleteComment(reply._id)}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/5"
                            aria-label="Supprimer la réponse"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-200 text-xs whitespace-pre-wrap break-words pl-8">
                      {reply.content}
                    </p>

                    {/* 2EME SOUS Replies section */}
                    {replyToReply === reply._id && (
                      <div className="mt-2 ml-8 border-l-2 border-arcanaBlue/30 pl-4">
                        <form
                          onSubmit={handleReply}
                          className="flex flex-col gap-2"
                        >
                          <div className="relative">
                            <input
                              ref={replyToReplyInputRef}
                              type="text"
                              value={replyToReplyContent}
                              onChange={(e) =>
                                setReplyToReplyContent(e.target.value)
                              }
                              placeholder={`Répondre à ${reply.userId?.username}...`}
                              disabled={submitting}
                              className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200 pr-10 text-sm"
                            />
                            {replyToReplyContent.length > 0 && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                {replyToReplyContent.length}/500
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={cancelReplyToReply}
                              className="px-3 py-1 text-sm rounded-lg bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              disabled={
                                !replyToReplyContent.trim() || submitting
                              }
                              className={`px-3 py-1 text-sm rounded-lg font-medium text-arcanaBackgroundDarker flex items-center gap-1 transition-colors ${
                                replyToReplyContent.trim() && !submitting
                                  ? "bg-arcanaBlue hover:bg-arcanaBlue/90"
                                  : "bg-arcanaBlue/50 cursor-not-allowed"
                              }`}
                            >
                              {submitting ? (
                                <div className="w-3 h-3 border-2 border-arcanaBackgroundDarker border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Reply size={18} />
                              )}
                              Répondre
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Sous-Replies section */}

                    <div>
                      {reply.replies && reply.replies.length > 0 && (
                        <div className="ml-8 mt-2 space-y-2 border-l-2 border-arcanaBlue/20 pl-4">
                          {(showAllSubReplies[reply._id]
                            ? reply.replies
                            : reply.replies.slice(0, 1)
                          ).map((subReply) => (
                            <div
                              key={subReply._id}
                              className="border border-white/5 bg-white/3 rounded-lg p-3 hover:border-white/10 transition-all duration-200"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <img
                                  src={subReply.userId?.avatar}
                                  alt="Avatar"
                                  className="w-6 h-6 rounded-full border border-white/20 object-cover cursor-pointer hover:border-arcanaBlue transition-all"
                                  onError={(e) => {
                                    e.target.src = "/assets/default-avatar.png";
                                  }}
                                  onClick={() =>
                                    handleNavigateToUserProfile(
                                      subReply.userId?._id
                                    )
                                  }
                                />
                                <div className="flex-1">
                                  <span
                                    className="font-medium text-white text-xs cursor-pointer hover:text-arcanaBlue transition-colors"
                                    onClick={() =>
                                      handleNavigateToUserProfile(
                                        subReply.userId?._id
                                      )
                                    }
                                  >
                                    {subReply.userId?.username ||
                                      "Utilisateur inconnu"}
                                  </span>
                                  <span className="text-gray-400 text-xs ml-2">
                                    {formatDate(subReply.createdAt)}
                                  </span>
                                </div>
                                {(userData.isAdmin ||
                                  userData.id === subReply.userId?._id) && (
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(subReply._id)
                                    }
                                    className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/5"
                                    aria-label="Supprimer la réponse"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-200 text-xs whitespace-pre-wrap break-words pl-8">
                                {subReply.content}
                              </p>

                              {/* Recursive replies */}
                              {subReply.replies &&
                                subReply.replies.length > 0 && (
                                  <div className="ml-8 mt-2 space-y-2 border-l-2 border-arcanaBlue/20 pl-4">
                                    {subReply.replies.map((nestedReply) => (
                                      <div
                                        key={nestedReply._id}
                                        className="border border-white/5 bg-white/3 rounded-lg p-3 hover:border-white/10 transition-all duration-200"
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <img
                                            src={nestedReply.userId?.avatar}
                                            alt="Avatar"
                                            className="w-6 h-6 rounded-full border border-white/20 object-cover cursor-pointer hover:border-arcanaBlue transition-all"
                                            onError={(e) => {
                                              e.target.src =
                                                "/assets/default-avatar.png";
                                            }}
                                            onClick={() =>
                                              handleNavigateToUserProfile(
                                                nestedReply.userId?._id
                                              )
                                            }
                                          />
                                          <div className="flex-1">
                                            <span
                                              className="font-medium text-white text-xs cursor-pointer hover:text-arcanaBlue transition-colors"
                                              onClick={() =>
                                                handleNavigateToUserProfile(
                                                  nestedReply.userId?._id
                                                )
                                              }
                                            >
                                              {nestedReply.userId?.username ||
                                                "Utilisateur inconnu"}
                                            </span>
                                            <span className="text-gray-400 text-xs ml-2">
                                              {formatDate(
                                                nestedReply.createdAt
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                        <p className="text-gray-200 text-xs whitespace-pre-wrap break-words pl-8">
                                          {nestedReply.content}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                      {reply.replies.length > 1 && (
                        <button
                          onClick={() => toggleShowAllSubReplies(reply._id)}
                          className="text-xs text-arcanaBlue hover:underline ml-8 mt-1"
                        >
                          {showAllSubReplies[reply._id]
                            ? "Afficher moins"
                            : `Afficher ${
                                reply.replies.length - 1
                              } réponse(s) supplémentaire(s)`}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Afficher le bouton Afficher plus / moins si plus d'une réponse */}
                {comment.replies.length > 1 && (
                  <button
                    onClick={() => setShowAllReplies((prev) => !prev)}
                    className="text-sm text-arcanaBlue hover:underline ml-8 mt-1"
                  >
                    {showAllReplies
                      ? "Afficher moins de réponses"
                      : `Afficher ${
                          comment.replies.length - 1
                        } réponse(s) supplémentaire(s)`}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="">
      <div className="relative w-full transform transition-all duration-300 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="truncate flex items-center">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <MessageSquare size={20} className="mr-2 text-arcanaBlue" />
              Commentaires{" "}
              <span className="ml-1 text-base">({commentCount})</span>
            </h2>
          </div>
        </div>

        {/* Comments list */}
        <div className="p-6 flex-1">
          {renderCommentsList()}

          {/* Show error banner if there's an error but we have comments */}
          {error && comments.length > 0 && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Comment form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 border-t border-white/10 bg-arcanaBackgroundDarker"
        >
          <div className="flex flex-col gap-4">
            <div className="relative flex items-center">
              <img
                className="w-11 h-11 rounded-full border border-white/20 object-cover mr-2"
                src={userData.avatar}
              />
              <input
                ref={commentInputRef}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Écrire un commentaire..."
                disabled={!userData.id || submitting}
                className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-gray-400 focus:border-arcanaBlue focus:outline-none transition-colors duration-200 pr-10"
              />
              {comment.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {comment.length}/500
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={!comment.trim() || !userData.id || submitting}
              className={`w-full rounded-xl py-3 font-medium text-arcanaBackgroundDarker hover:bg-arcanaBlue/90 focus:outline-none transition-all duration-300 flex items-center justify-center
                ${
                  comment.trim() && userData.id && !submitting
                    ? "bg-arcanaBlue"
                    : "bg-arcanaBlue/50 cursor-not-allowed"
                }`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-arcanaBackgroundDarker border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              Publier le commentaire
            </button>
          </div>

          {!userData.id && (
            <p className="mt-2 text-center text-sm text-red-400">
              Vous devez être connecté pour commenter
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
