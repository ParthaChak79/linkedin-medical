import { useState } from "react";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/authStore";
import { X, Search, User, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuthStore();
  const trpc = useTRPC();

  // For now, we'll get all users from the feed data as a simple search
  // In a real app, you'd want a dedicated search endpoint
  const feedQuery = useQuery(
    trpc.getFeed.queryOptions({
      authToken: token!,
    }, {
      enabled: !!token && isOpen,
    })
  );

  const sendConnectionRequestMutation = useMutation(
    trpc.sendConnectionRequest.mutationOptions({
      onSuccess: () => {
        toast.success("Connection request sent!");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  if (!isOpen) return null;

  // Extract unique users from feed posts
  const allUsers = feedQuery.data?.posts?.map(post => post.author) || [];
  const uniqueUsers = allUsers.filter((user, index, self) => 
    index === self.findIndex(u => u.id === user.id)
  );

  // Filter users based on search term
  const filteredUsers = uniqueUsers.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.medicalProfile?.professionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.medicalProfile?.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendRequest = (userId: number) => {
    sendConnectionRequestMutation.mutate({
      authToken: token!,
      receiverId: userId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Find Healthcare Professionals</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, profession, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {feedQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "No users found matching your search." : "Start typing to search for healthcare professionals."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.medicalProfile?.profilePictureUrl ? (
                        <img
                          src={user.medicalProfile.profilePictureUrl}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      {user.medicalProfile && (
                        <p className="text-sm text-gray-600">
                          {user.medicalProfile.professionType} • {user.medicalProfile.specialty}
                        </p>
                      )}
                      {user.medicalProfile?.location && (
                        <p className="text-sm text-gray-500">{user.medicalProfile.location}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    disabled={sendConnectionRequestMutation.isPending}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
                  >
                    <UserPlus size={16} />
                    <span>Connect</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
