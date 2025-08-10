import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "~/components/Layout";
import { JobApplicationModal } from "~/components/JobApplicationModal";
import { useAuthStore } from "~/stores/authStore";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MapPin, Building, Clock, DollarSign, Filter } from "lucide-react";

export const Route = createFileRoute("/jobs/")({
  component: JobsPage,
});

function JobsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const trpc = useTRPC();
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [applicationModalState, setApplicationModalState] = useState<{
    isOpen: boolean;
    jobId: number | null;
    jobTitle: string;
    organizationName: string;
  }>({
    isOpen: false,
    jobId: null,
    jobTitle: "",
    organizationName: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const jobsQuery = useQuery(
    trpc.getJobPostings.queryOptions({
      limit: 20,
      specialty: specialtyFilter || undefined,
      location: locationFilter || undefined,
    })
  );

  const openApplicationModal = (jobId: number, jobTitle: string, organizationName: string) => {
    setApplicationModalState({
      isOpen: true,
      jobId,
      jobTitle,
      organizationName,
    });
  };

  const closeApplicationModal = () => {
    setApplicationModalState({
      isOpen: false,
      jobId: null,
      jobTitle: "",
      organizationName: "",
    });
  };

  const handleApplicationSubmitted = () => {
    // Optionally refetch jobs to update application count
    jobsQuery.refetch();
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Job Opportunities</h1>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Filter by Specialty
              </label>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Family Medicine">Family Medicine</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Neurology">Neurology</option>
                <option value="Nursing">Nursing</option>
                <option value="Oncology">Oncology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Radiology">Radiology</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Filter by Location
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Enter city or state"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSpecialtyFilter("");
                  setLocationFilter("");
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        {jobsQuery.isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading job postings...</p>
          </div>
        )}

        {jobsQuery.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading jobs: {jobsQuery.error.message}
          </div>
        )}

        {jobsQuery.data?.jobPostings.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Building size={16} />
                    <span>{job.organization.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{job.jobType}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center space-x-1">
                      <DollarSign size={16} />
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {job.specialty}
                  </span>
                  <span className="text-xs text-gray-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
              <p className="text-gray-700 mb-4 line-clamp-2">{job.requirements}</p>
            </div>

            {job.organization.description && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">About {job.organization.name}</h3>
                <p className="text-gray-700 text-sm">{job.organization.description}</p>
                {job.organization.website && (
                  <a
                    href={job.organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block"
                  >
                    Visit website →
                  </a>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {job.applications.length} {job.applications.length === 1 ? "application" : "applications"}
              </div>
              <button 
                onClick={() => openApplicationModal(job.id, job.title, job.organization.name)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}

        {jobsQuery.data?.jobPostings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No job postings found{specialtyFilter || locationFilter ? " matching your filters" : ""}.
            </p>
            {(specialtyFilter || locationFilter) && (
              <button
                onClick={() => {
                  setSpecialtyFilter("");
                  setLocationFilter("");
                }}
                className="text-blue-600 hover:text-blue-500"
              >
                Clear filters to see all jobs
              </button>
            )}
          </div>
        )}

        <JobApplicationModal
          isOpen={applicationModalState.isOpen}
          onClose={closeApplicationModal}
          jobId={applicationModalState.jobId || 0}
          jobTitle={applicationModalState.jobTitle}
          organizationName={applicationModalState.organizationName}
          onApplicationSubmitted={handleApplicationSubmitted}
        />
      </div>
    </Layout>
  );
}
