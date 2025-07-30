import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import axios from "../../services/axios";
import {
  FiArrowLeft,
  FiSend,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiInfo,
  FiSmile,
} from "react-icons/fi";

const ChatWindow = ({ receiver, onBack }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset } = useForm();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const currentRole = localStorage.getItem("role");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  if (!receiver) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSmile className="text-3xl text-slate-400" />
          </div>
          <p className="text-lg font-medium">
            Select a contact to start chatting
          </p>
        </div>
      </div>
    );
  }

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/message/thread/${receiver._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [receiver]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const onSubmit = async (data) => {
    const payload = {
      content: data.content,
      receiver: receiver._id,
      receiverModel: receiver.subject ? "teacher" : "student",
    };

    await axios.post("/message/send", payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    reset();
    fetchMessages();
  };

  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageTime.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Enhanced Chat Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
        <div className="flex items-center space-x-3">
          {/* Enhanced Back button for mobile */}
          <button
            className="md:hidden p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            onClick={onBack}
          >
            <FiArrowLeft className="text-xl text-slate-600" />
          </button>

          {/* User Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {receiver.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)}
            </span>
          </div>

          {/* User Info */}
          <div>
            <h3 className="font-bold text-slate-800">{receiver.name}</h3>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div
                  className={`max-w-xs p-3 rounded-2xl ${
                    i % 2 === 0 ? "ml-auto bg-gray-200" : "mr-auto bg-gray-300"
                  }`}
                >
                  <div className="h-4 bg-gray-400 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-400 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSmile className="text-2xl text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">
                Start the conversation
              </h4>
              <p className="text-slate-600">
                Send your first message to {receiver.name}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.senderModel === currentRole;
            const showAvatar =
              !isOwn &&
              (index === 0 || messages[index - 1].senderModel === currentRole);

            return (
              <div
                key={msg._id}
                className={`flex items-end space-x-2 ${
                  isOwn ? "flex-row-reverse space-x-reverse" : "flex-row"
                }`}
              >
                {/* Avatar for received messages */}
                {!isOwn && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      showAvatar
                        ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                        : "bg-transparent"
                    }`}
                  >
                    {showAvatar && (
                      <span className="text-white font-bold text-xs">
                        {receiver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </span>
                    )}
                  </div>
                )}

                {/* Enhanced Message Bubble */}
                <div
                  className={`max-w-xs md:max-w-sm p-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                    isOwn
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md"
                      : "bg-white text-slate-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <div className="text-sm leading-relaxed">{msg.content}</div>
                  <div
                    className={`text-xs mt-2 ${
                      isOwn ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {formatMessageTime(msg.sentAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Enhanced Input Bar - Same Logic, Better Design */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center p-3 bg-white shadow-inner gap-2"
        >
          <input
            {...register("content")}
            placeholder="Type a message"
            className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
            required
          />
          <button
            type="submit"
            className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
              isSending
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95"
            }`}
            title="Send message"
          >
            {isSending ? (
              <div className="animate-spin w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            ) : (
              <FiSend className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
