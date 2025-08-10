import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/authStore";
import { Layout } from "~/components/Layout";
import { useState, useEffect } from "react";
import { Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
import { z } from "zod";

const JobCreateSearch = z.object({
  organizationId: z.number().optional(),
});

export const Route = createFileRoute("/jobs/create/")({
  component: CreateJobPage,
  validateSearch: JobCreateSearch,
});

type CreateJobForm = {
  organizationId: number;
  title: string;
  description: string;
  requirements: string;
  salary?: string;
  location: string;
  jobType: string;
  specialty: string;
};

function CreateJobPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { isAuthenticated, token } = useAuthStore();
  const { organizationId } = Route.useSearch();
  const [createError, setCreateError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateJobForm>();

  // Get user's organizations
  const organizationsQuery = useQuery(
    trpc.getUserOrganizations.queryOptions({
      authToken: token || "",
    }, {
      enabled: !!token,
    })
  );

  // Set default organization if provided in search params
  useEffect(() => {
    if (organizationId) {
      setValue("organizationId", organizationId);
    }
  }, [organizationId, setValue]);

  const createJobMutation = useMutation(
    trpc.createJobPosting.mutationOptions({
      onSuccess: (data) => {
        navigate({ to: "/organizations/manage" });
      },
      onError: (error: any) => {
        setCreateError(error.message || "Failed to create job posting");
      },
    })
  );

  const onSubmit = (data: CreateJobForm) => {
    if (!token) return;
    
    setCreateError(null);
    createJobMutation.mutate({
      authToken: token,
      ...data,
    });
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
        </div>

        <p className="text-gray-600 mb-6">
          Create a job posting to attract qualified medical professionals to your organization.
        </p>

        {createError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {createError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="organizationId"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Organization *
            </label>
            <select
              id="organizationId"
              {...register("organizationId", { 
                required: "Please select an organization",
                valueAsNumber: true 
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an organization</option>
              {organizationsQuery.data?.memberships.map((membership) => (
                <option key={membership.organization.id} value={membership.organization.id}>
                  {membership.organization.name}
                </option>
              ))}
            </select>
            {errors.organizationId && (
              <p className="mt-1 text-sm text-red-600">{errors.organizationId.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Job Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Emergency Medicine Physician"
              {...register("title", { required: "Job title is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="specialty"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Specialty *
              </label>
              <select
                id="specialty"
                {...register("specialty", { required: "Specialty is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select specialty</option>
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
                <option value="Other">Other</option>
              </select>
              {errors.specialty && (
                <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="jobType"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                <Clock size={16} className="inline mr-1" />
                Job Type *
              </label>
              <select
                id="jobType"
                {...register("jobType", { required: "Job type is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select job type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Per Diem">Per Diem</option>
                <option value="Locum Tenens">Locum Tenens</option>
              </select>
              {errors.jobType && (
                <p className="mt-1 text-sm text-red-600">{errors.jobType.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="location"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                <MapPin size={16} className="inline mr-1" />
                Location *
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g., New York, NY"
                {...register("location", { required: "Location is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="salary"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                <DollarSign size={16} className="inline mr-1" />
                Salary (Optional)
              </label>
              <input
                id="salary"
                type="text"
                placeholder="e.g., $280,000 - $350,000"
                {...register("salary")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Job Description *
            </label>
            <textarea
              id="description"
              rows={6}
              placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
              {...register("description", { required: "Job description is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="requirements"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Requirements *
            </label>
            <textarea
              id="requirements"
              rows={4}
              placeholder="List the required qualifications, certifications, experience, and skills..."
              {...register("requirements", { required: "Requirements are required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/organizations/manage" })}
              className="flex-1 rounded-md bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createJobMutation.isPending}
              className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {createJobMutation.isPending ? "Posting Job..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
