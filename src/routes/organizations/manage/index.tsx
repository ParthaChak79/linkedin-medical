import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/authStore";
import { Layout } from "~/components/Layout";
import { useState, useEffect } from "react";
import { Building, Plus, Briefcase, Users, MapPin, Globe } from "lucide-react";

export const Route = createFileRoute("/organizations/manage/")({
  component: ManageOrganizationsPage,
});

function ManageOrganizationsPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { isAuthenticated, token } = useAuthStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const organizationsQuery = useQuery(
    trpc.getUserOrganizations.queryOptions({
      authToken: token || "",
    }, {
      enabled: !!token,
    })
  );

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Organizations</h1>
            </div>
            <button
              onClick={() => navigate({ to: "/organizations/create" })}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Create Organization</span>
            </button>
          </div>

          {organizationsQuery.isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading your organizations...</p>
            </div>
          )}

          {organizationsQuery.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error loading organizations: {organizationsQuery.error.message}
            </div>
          )}

          {organizationsQuery.data?.memberships.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven't created any organizations yet.</p>
              <button
                onClick={() => navigate({ to: "/organizations/create" })}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Organization
              </button>
            </div>
          )}

          {organizationsQuery.data?.memberships.map((membership) => (
            <div key={membership.id} className="border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {membership.organization.name}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {membership.organization.type}
                    </span>
                    {membership.organization.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{membership.organization.location}</span>
                      </div>
                    )}
                    {membership.organization.website && (
                      <div className="flex items-center space-x-1">
                        <Globe size={14} />
                        <a
                          href={membership.organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                  {membership.organization.description && (
                    <p className="text-gray-700 mb-4">{membership.organization.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Briefcase size={16} />
                    <span>
                      {membership.organization.jobPostings.length} active job
                      {membership.organization.jobPostings.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {membership.role}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate({ 
                      to: "/jobs/create", 
                      search: { organizationId: membership.organization.id } 
                    })}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Post Job
                  </button>
                  <button
                    onClick={() => navigate({ 
                      to: "/organizations/$organizationId/applications", 
                      params: { organizationId: membership.organization.id.toString() } 
                    })}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                  >
                    View Applications
                  </button>
                </div>
              </div>

              {membership.organization.jobPostings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-3">Recent Job Postings</h3>
                  <div className="space-y-2">
                    {membership.organization.jobPostings.slice(0, 3).map((job) => (
                      <div key={job.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium text-sm">{job.title}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {job.specialty} • {job.location}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate({ 
                            to: "/jobs/$jobId/applications", 
                            params: { jobId: job.id.toString() } 
                          })}
                          className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                          View Applications
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
