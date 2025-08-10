import { useForm } from "react-hook-form";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/authStore";
import { useState } from "react";
import { X, Upload, FileText, Loader2 } from "lucide-react";

type JobApplicationForm = {
  coverLetter?: string;
  resume?: FileList;
};

type JobApplicationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  organizationName: string;
  onApplicationSubmitted?: () => void;
};

export function JobApplicationModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  organizationName,
  onApplicationSubmitted,
}: JobApplicationModalProps) {
  const trpc = useTRPC();
  const { token } = useAuthStore();
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<JobApplicationForm>();

  const resumeFile = watch("resume");

  // Get Minio base URL for displaying uploaded resume
  const minioBaseUrlQuery = useQuery(
    trpc.getMinioBaseUrl.queryOptions({}, { enabled: isOpen })
  );

  const getPresignedUrlMutation = useMutation(
    trpc.getMinioPresignedUrlForResumeUpload.mutationOptions()
  );

  const applyToJobMutation = useMutation(
    trpc.applyToJob.mutationOptions({
      onSuccess: () => {
        reset();
        onClose();
        onApplicationSubmitted?.();
      },
      onError: (error: any) => {
        setApplicationError(error.message || "Failed to submit application");
      },
    })
  );

  const onSubmit = async (data: JobApplicationForm) => {
    if (!token) return;

    setApplicationError(null);
    setUploadProgress(null);

    try {
      let resumeUrl: string | undefined;

      // Handle resume upload if file is selected
      if (data.resume && data.resume.length > 0) {
        const file = data.resume[0];
        setUploadProgress("Getting upload URL...");

        // Get presigned URL for resume upload
        const presignedResponse = await getPresignedUrlMutation.mutateAsync({
          authToken: token,
          fileName: file.name,
          contentType: file.type,
        });

        setUploadProgress("Uploading resume...");

        // Upload file to Minio
        const uploadResponse = await fetch(presignedResponse.presignedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload resume");
        }

        // Construct the resume URL
        resumeUrl = `${minioBaseUrlQuery.data?.baseUrl}/resumes/${presignedResponse.fileName}`;
      }

      setUploadProgress("Submitting application...");

      // Submit application
      applyToJobMutation.mutate({
        authToken: token,
        jobPostingId: jobId,
        coverLetter: data.coverLetter,
        resumeUrl,
      });
    } catch (error: any) {
      setApplicationError(error.message || "Failed to submit application");
      setUploadProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Apply for Position</h2>
            <p className="text-sm text-gray-600 mt-1">
              {jobTitle} at {organizationName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {applicationError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {applicationError}
            </div>
          )}

          {uploadProgress && (
            <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="resume"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              <FileText size={16} className="inline mr-1" />
              Resume (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                {...register("resume")}
                className="hidden"
              />
              <label
                htmlFor="resume"
                className="cursor-pointer text-blue-600 hover:text-blue-500"
              >
                Click to upload your resume
              </label>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
              {resumeFile && resumeFile.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {resumeFile[0].name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="coverLetter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Cover Letter (Optional)
            </label>
            <textarea
              id="coverLetter"
              rows={6}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              {...register("coverLetter")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={applyToJobMutation.isPending || !!uploadProgress}
              className="flex-1 rounded-md bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyToJobMutation.isPending || !!uploadProgress}
              className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {applyToJobMutation.isPending || uploadProgress ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
