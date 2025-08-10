import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "~/components/Layout";
import { useAuthStore } from "~/stores/authStore";
import { useState, useEffect } from "react";
import { User, MapPin, Briefcase, Award, Calendar, Edit } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const trpc = useTRPC();

  // Get connections count
  const connectionsQuery = useQuery(
    trpc.getConnections.queryOptions({
      authToken: token!,
    }, {
      enabled: !!token && isAuthenticated(),
    })
  );

  const connectionsCount = connectionsQuery.data?.length || 0;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated() || !user) {
    return null;
  }

  const medicalProfile = user.medicalProfile;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>
          <div className="relative px-6 pb-6">
            <div className="flex items-end space-x-4 -mt-16">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                {medicalProfile?.profilePictureUrl ? (
                  <img
                    src={medicalProfile.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 pt-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                {medicalProfile && (
                  <>
                    <p className="text-lg text-gray-600 mt-1">
                      {medicalProfile.professionType} • {medicalProfile.specialty}
                    </p>
                  </>
                )}
                {medicalProfile?.currentPosition && (
                  <p className="text-gray-600 mt-1">{medicalProfile.currentPosition}</p>
                )}
                {medicalProfile?.location && (
                  <div className="flex items-center space-x-1 text-gray-600 mt-2">
                    <MapPin size={16} />
                    <span>{medicalProfile.location}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              {medicalProfile?.bio ? (
                <p className="text-gray-700 whitespace-pre-wrap">{medicalProfile.bio}</p>
              ) : (
                <p className="text-gray-500 italic">No bio added yet.</p>
              )}
            </div>

            {/* Professional Experience */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Experience</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Years of Experience</p>
                    <p className="text-gray-600">
                      {medicalProfile?.yearsOfExperience} {medicalProfile?.yearsOfExperience === 1 ? "year" : "years"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Profession</p>
                    <p className="text-gray-600">{medicalProfile?.professionType}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Briefcase size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Specialty</p>
                    <p className="text-gray-600">{medicalProfile?.specialty}</p>
                  </div>
                </div>

                {medicalProfile?.licenseNumber && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">License Number</p>
                      <p className="text-gray-600">{medicalProfile.licenseNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                {medicalProfile?.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-gray-600">{medicalProfile.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connections</span>
                  <span className="font-semibold text-gray-900">{connectionsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
            <p className="text-gray-600">
              Profile editing functionality will be implemented in a future update. 
              For now, you can view your profile information above.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
