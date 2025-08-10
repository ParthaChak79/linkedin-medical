import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "~/components/Layout";
import { UserSearchModal } from "~/components/UserSearchModal";
import { useAuthStore } from "~/stores/authStore";
import { useState, useEffect } from "react";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, UserCheck, UserPlus, MessageCircle, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/connections/")({
  component: ConnectionsPage,
});

function ConnectionsPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"connections" | "requests">("connections");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const trpc = useTRPC();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  // Queries
  const connectionsQuery = useQuery(
    trpc.getConnections.queryOptions({
      authToken: token!,
    }, {
      enabled: !!token,
    })
  );

  const connectionRequestsQuery = useQuery(
    trpc.getConnectionRequests.queryOptions({
      authToken: token!,
    }, {
      enabled: !!token,
    })
  );

  // Mutations
  const respondToRequestMutation = useMutation(
    trpc.respondToConnectionRequest.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          data.connection.status === "accepted"
            ? "Connection request accepted!"
            : "Connection request rejected"
        );
        // Refetch both queries to update the UI
        connectionsQuery.refetch();
        connectionRequestsQuery.refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  if (!isAuthenticated() || !token) {
    return null;
  }

  const connections = connectionsQuery.data || [];
  const requests = connectionRequestsQuery.data;
  const incomingRequests = requests?.incoming || [];
  const outgoingRequests = requests?.outgoing || [];

  const handleRespondToRequest = (connectionId: number, response: "accepted" | "rejected") => {
    respondToRequestMutation.mutate({
      authToken: token,
      connectionId,
      response,
    });
  };

  const handleMessageUser = (userId: number) => {
    navigate({ to: `/messages/${userId}` });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connections</h1>
          <p className="text-gray-600">
            Manage your professional network and connect with other healthcare professionals.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("connections")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "connections"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserCheck size={16} />
                  <span>My Connections ({connections.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "requests"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserPlus size={16} />
                  <span>
                    Requests ({incomingRequests.length + outgoingRequests.length})
                  </span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "connections" && (
              <div>
                {connectionsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : connections.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start building your professional network by connecting with other healthcare professionals.
                    </p>
                    <button
                      onClick={() => setIsSearchModalOpen(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Find People to Connect
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Your Connections</h3>
                      <button
                        onClick={() => setIsSearchModalOpen(true)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Find More People
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {connections.map((connection) => (
                        <div
                          key={connection.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                              <h3 className="font-medium text-gray-900">
                                {connection.connectedUser.firstName} {connection.connectedUser.lastName}
                              </h3>
                              {connection.connectedUser.medicalProfile && (
                                <p className="text-sm text-gray-600">
                                  {connection.connectedUser.medicalProfile.professionType} •{" "}
                                  {connection.connectedUser.medicalProfile.specialty}
                                </p>
                              )}
                              {connection.connectedUser.medicalProfile?.location && (
                                <p className="text-sm text-gray-500">
                                  {connection.connectedUser.medicalProfile.location}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleMessageUser(connection.connectedUser.id)}
                              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                              title="Send message"
                            >
                              <MessageCircle size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="space-y-6">
                {/* Incoming Requests */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Incoming Requests ({incomingRequests.length})
                  </h3>
                  {incomingRequests.length === 0 ? (
                    <p className="text-gray-600">No incoming connection requests.</p>
                  ) : (
                    <div className="space-y-3">
                      {incomingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              {request.requester.medicalProfile?.profilePictureUrl ? (
                                <img
                                  src={request.requester.medicalProfile.profilePictureUrl}
                                  alt="Profile"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User size={24} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {request.requester.firstName} {request.requester.lastName}
                              </h4>
                              {request.requester.medicalProfile && (
                                <p className="text-sm text-gray-600">
                                  {request.requester.medicalProfile.professionType} •{" "}
                                  {request.requester.medicalProfile.specialty}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRespondToRequest(request.id, "accepted")}
                              disabled={respondToRequestMutation.isPending}
                              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
                            >
                              <Check size={16} />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(request.id, "rejected")}
                              disabled={respondToRequestMutation.isPending}
                              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
                            >
                              <X size={16} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Outgoing Requests */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Outgoing Requests ({outgoingRequests.length})
                  </h3>
                  {outgoingRequests.length === 0 ? (
                    <p className="text-gray-600">No outgoing connection requests.</p>
                  ) : (
                    <div className="space-y-3">
                      {outgoingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              {request.receiver.medicalProfile?.profilePictureUrl ? (
                                <img
                                  src={request.receiver.medicalProfile.profilePictureUrl}
                                  alt="Profile"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User size={24} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {request.receiver.firstName} {request.receiver.lastName}
                              </h4>
                              {request.receiver.medicalProfile && (
                                <p className="text-sm text-gray-600">
                                  {request.receiver.medicalProfile.professionType} •{" "}
                                  {request.receiver.medicalProfile.specialty}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Search Modal */}
        <UserSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
        />
      </div>
    </Layout>
  );
}
