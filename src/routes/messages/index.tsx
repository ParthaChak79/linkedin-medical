import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "~/components/Layout";
import { useAuthStore } from "~/stores/authStore";
import { useEffect } from "react";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { User, MessageCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/messages/")({
  component: MessagesIndexPage,
});

function MessagesIndexPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  const trpc = useTRPC();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  // Get user's connections
  const connectionsQuery = useQuery(
    trpc.getConnections.queryOptions({
      authToken: token!,
    }, {
      enabled: !!token,
    })
  );

  if (!isAuthenticated() || !token) {
    return null;
  }

  const connections = connectionsQuery.data || [];

  const handleStartConversation = (userId: number) => {
    navigate({ to: `/messages/${userId}` });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            Start conversations with your professional connections.
          </p>
        </div>

        {/* Conversations */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            {connectionsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
                <p className="text-gray-600 mb-4">
                  You need to connect with other healthcare professionals before you can message them.
                </p>
                <button
                  onClick={() => navigate({ to: "/connections" })}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Find Connections
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Your Connections ({connections.length})
                </h3>
                <div className="space-y-2">
                  {connections.map((connection) => (
                    <button
                      key={connection.id}
                      onClick={() => handleStartConversation(connection.connectedUser.id)}
                      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {connection.connectedUser.medicalProfile?.profilePictureUrl ? (
                            <img
                              src={connection.connectedUser.medicalProfile.profilePictureUrl}
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User size={24} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {connection.connectedUser.firstName} {connection.connectedUser.lastName}
                            </h4>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>Connected {new Date(connection.connectedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {connection.connectedUser.medicalProfile && (
                            <p className="text-sm text-gray-600">
                              {connection.connectedUser.medicalProfile.professionType} •{" "}
                              {connection.connectedUser.medicalProfile.specialty}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Click to start a conversation
                          </p>
                        </div>
                        <MessageCircle size={20} className="text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
