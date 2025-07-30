import { useState } from "react";
import ConversationList from "../components/messaging/ConversationList";
import ChatWindow from "../components/messaging/ChatWindow";
import { FiMessageCircle, FiUsers } from "react-icons/fi";

const MessagingPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="pt-16 h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-sm border-b border-blue-100 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <FiMessageCircle className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
              <p className="text-slate-600 text-sm">
                Connect with students and teachers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full px-4 py-6">
          <div className="bg-white rounded-2xl shadow-lg border border-white/50 h-full overflow-hidden flex">
            {/* Contact List Sidebar */}
            <div
              className={`md:w-1/3 w-full border-r border-gray-200 ${
                selectedUser ? "hidden md:block" : "block"
              }`}
            >
              <ConversationList
                onSelect={setSelectedUser}
                selectedUser={selectedUser}
              />
            </div>

            {/* Chat Window */}
            <div
              className={`md:w-2/3 w-full ${
                selectedUser
                  ? "block"
                  : "hidden md:flex md:items-center md:justify-center"
              }`}
            >
              {!selectedUser ? (
                <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-6">
                    <FiUsers className="text-4xl text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Welcome to Messages
                  </h3>
                  <p className="text-slate-600 max-w-md">
                    Select a contact from the sidebar to start a conversation.
                    Connect with students and teachers seamlessly.
                  </p>
                </div>
              ) : (
                <ChatWindow
                  receiver={selectedUser}
                  onBack={() => setSelectedUser(null)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
