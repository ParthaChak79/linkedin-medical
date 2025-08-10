import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/authStore";
import { Layout } from "~/components/Layout";
import { useState, useEffect } from "react";
import { Users, FileText, Mail, MapPin, Calendar, Download, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/jobs/$jobId/applications/")({
  component: JobApplicationsPage,
});

function JobApplicationsPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { jobId } = Route.useParams();
  const { isAuthenticated, token } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const applicationsQuery = useQuery(
    trpc.getJobApplications.queryOptions({
      authToken: token || "",
      jobPostingId: parseInt(jobId),
    }, {
      enabled: !!token && !!jobId,
    })
  );

  const updateStatusMutation = useMutation(
    trpc.updateApplicationStatus.mutationOptions({
      onSuccess: () => {
        applicationsQuery.refetch();
      },
    })
  );

  const handleStatusUpdate = (applicationId: number, status: string) => {
    if (!token) return;
    
    updateStatusMutation.mutate({
      authToken: token,
      applicationId,
      status: status as "pending" | "reviewed" | "accepted" | "rejected",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredApplications = applicationsQuery.data?.applications.filter(app => 
    statusFilter === "all" || app.status === statusFilter
  ) || [];

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
                {applicationsQuery.data?.jobPosting && (
                  <p className="text-gray-600">
                    {applicationsQuery.data.jobPosting.title} at {applicationsQuery.data.jobPosting.organization.name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/organizations/manage" })}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back to Organizations
            </button>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {applicationsQuery.isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading applications...</p>
            </div>
          )}

          {applicationsQuery.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error loading applications: {applicationsQuery.error.message}
            </div>
          )}

          {filteredApplications.length === 0 && !applicationsQuery.isLoading && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {statusFilter === "all" 
                  ? "No applications received yet." 
                  : `No ${statusFilter} applications found.`}
              </p>
            </div>
          )}

          {filteredApplications.map((application) => (
            <div key={application.id} className="border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.user.firstName} {application.user.lastName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  
                  {application.user.medicalProfile && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {application.user.medicalProfile.professionType}
                      </span>
                      <span>{application.user.medicalProfile.specialty}</span>
                      <span>{application.user.medicalProfile.yearsOfExperience} years experience</span>
                      {application.user.medicalProfile.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{application.user.medicalProfile.location}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Mail size={14} />
                      <span>{application.user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {application.resumeUrl && (
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-500 text-sm"
                    >
                      <Download size={16} />
                      <span>Resume</span>
                    </a>
                  )}
                  
                  <div className="relative">
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusUpdate(application.id, e.target.value)}
                      disabled={updateStatusMutation.isPending}
                      className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {application.coverLetter && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              )}

              {application.user.medicalProfile?.bio && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Professional Bio</h4>
                  <p className="text-gray-700 text-sm">
                    {application.user.medicalProfile.bio}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
