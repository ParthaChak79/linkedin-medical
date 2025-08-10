import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "~/components/Layout";
import { useAuthStore } from "~/stores/authStore";
import { useState, useEffect, useRef } from "react";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Send, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/messages/$userId/")({
  component: MessagesPage,
});

function MessagesPage() {
  const navigate = useNavigate();
  const { userId } = Route.useParams();
  const { token, user, isAuthenticated } = useAuthStore();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const trpc = useTRPC();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  // Parse userId from route params
  const otherUserId = parseInt(userId);

  // Query for messages
  const messagesQuery = useQuery(
    trpc.getMessages.queryOptions({
      authToken: token!,
      otherUserId,
    }, {
      enabled: !!token && !isNaN(otherUserId),
      refetchInterval: 3000, // Refetch every 3 seconds for real-time feel
    })
  );

  // Query for user connections to get the other user's info
  const connectionsQuery = useQuery(
    trpc.getConnections.queryOptions({
      authToken: token!,
    }, {
      enabled: !!token,
    })
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    trpc.sendMessage.mutationOptions({
      onSuccess: () => {
        setMessage("");
        messagesQuery.refetch();
        // Scroll to bottom after sending
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  // Scroll to bottom when messages load
  useEffect(() => {
    if (messagesQuery.data?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesQuery.data?.messages]);

  if (!isAuthenticated() || !token || !user) {
    return null;
  }

  if (isNaN(otherUserId)) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid User</h1>
            <p className="text-gray-600">The user ID provided is not valid.</p>
            <button
              onClick={() => navigate({ to: "/connections" })}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Connections
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Find the other user from connections
  const connections = connectionsQuery.data || [];
  const otherUser = connections.find(conn => conn.connectedUser.id === otherUserId)?.connectedUser;

  const messages = messagesQuery.data?.messages || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      authToken: token,
      receiverId: otherUserId,
      content: message.trim(),
    });
  };

  const formatMessageTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-md p-4 border-b">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate({ to: "/connections" })}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {otherUser?.medicalProfile?.profilePictureUrl ? (
                <img
                  src={otherUser.medicalProfile.profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={20} className="text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Loading..."}
              </h1>
              {otherUser?.medicalProfile && (
                <p className="text-sm text-gray-600">
                  {otherUser.medicalProfile.professionType} • {otherUser.medicalProfile.specialty}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4">
          {messagesQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-b-lg shadow-md p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sendMessageMutation.isPending}
            />
            <button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
