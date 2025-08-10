import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/authStore";
import { Layout } from "~/components/Layout";
import { useState, useEffect } from "react";
import { Building, Globe, MapPin } from "lucide-react";

export const Route = createFileRoute("/organizations/create/")({
  component: CreateOrganizationPage,
});

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  type: z.string().min(1, "Organization type is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
      message: "Please enter a valid URL (e.g., https://example.com)",
    }),
});

type CreateOrganizationForm = {
  name: string;
  type: string;
  description?: string;
  location?: string;
  website?: string;
};

function CreateOrganizationPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { isAuthenticated, token } = useAuthStore();
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
  } = useForm<CreateOrganizationForm>({
    resolver: zodResolver(createOrganizationSchema),
  });

  const createOrgMutation = useMutation(
    trpc.createOrganization.mutationOptions({
      onSuccess: (data) => {
        navigate({ to: "/organizations/manage" });
      },
      onError: (error: any) => {
        // Extract user-friendly error messages
        if (error.data?.zodError) {
          const zodErrors = error.data.zodError;
          if (zodErrors.website) {
            setCreateError("Please enter a valid website URL (e.g., https://example.com)");
          } else {
            setCreateError("Please check your input and try again");
          }
        } else if (error.message) {
          setCreateError(error.message);
        } else {
          setCreateError("Failed to create organization");
        }
      },
    })
  );

  const onSubmit = (data: CreateOrganizationForm) => {
    if (!token) return;
    
    setCreateError(null);
    
    // Convert empty string to undefined for optional fields
    const submitData = {
      ...data,
      website: data.website === "" ? undefined : data.website,
      description: data.description === "" ? undefined : data.description,
      location: data.location === "" ? undefined : data.location,
    };
    
    createOrgMutation.mutate({
      authToken: token,
      ...submitData,
    });
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Building className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Create Organization</h1>
        </div>

        <p className="text-gray-600 mb-6">
          Create an organization page to represent your hospital, clinic, or healthcare facility. 
          You'll be able to post job openings and manage applications.
        </p>

        {createError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {createError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Organization Name *
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g., City General Hospital"
              {...register("name")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Organization Type *
            </label>
            <select
              id="type"
              {...register("type")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select organization type</option>
              <option value="Hospital">Hospital</option>
              <option value="Clinic">Clinic</option>
              <option value="Nursing Home">Nursing Home</option>
              <option value="Research">Research Institute</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Other">Other</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              <MapPin size={16} className="inline mr-1" />
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g., New York, NY"
              {...register("location")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="website"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              <Globe size={16} className="inline mr-1" />
              Website
            </label>
            <input
              id="website"
              type="url"
              placeholder="https://example.com"
              {...register("website")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a complete URL including http:// or https://
            </p>
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Tell potential applicants about your organization, mission, and values..."
              {...register("description")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              disabled={createOrgMutation.isPending}
              className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {createOrgMutation.isPending ? "Creating..." : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
