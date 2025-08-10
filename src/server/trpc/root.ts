import {
  createCallerFactory,
  createTRPCRouter,
  baseProcedure,
} from "~/server/trpc/main";
import { register } from "~/server/trpc/procedures/register";
import { login } from "~/server/trpc/procedures/login";
import { getCurrentUser } from "~/server/trpc/procedures/getCurrentUser";
import { createPost } from "~/server/trpc/procedures/createPost";
import { getFeed } from "~/server/trpc/procedures/getFeed";
import { getJobPostings } from "~/server/trpc/procedures/getJobPostings";
import { likePost } from "~/server/trpc/procedures/likePost";
import { addComment } from "~/server/trpc/procedures/addComment";
import { getMinioBaseUrl } from "~/server/trpc/procedures/getMinioBaseUrl";
import { createOrganization } from "~/server/trpc/procedures/createOrganization";
import { createJobPosting } from "~/server/trpc/procedures/createJobPosting";
import { applyToJob } from "~/server/trpc/procedures/applyToJob";
import { getJobApplications } from "~/server/trpc/procedures/getJobApplications";
import { updateApplicationStatus } from "~/server/trpc/procedures/updateApplicationStatus";
import { getUserOrganizations } from "~/server/trpc/procedures/getUserOrganizations";
import { getMinioPresignedUrlForResumeUpload } from "~/server/trpc/procedures/getMinioPresignedUrlForResumeUpload";
import { sendConnectionRequest } from "~/server/trpc/procedures/sendConnectionRequest";
import { respondToConnectionRequest } from "~/server/trpc/procedures/respondToConnectionRequest";
import { getConnectionRequests } from "~/server/trpc/procedures/getConnectionRequests";
import { getConnections } from "~/server/trpc/procedures/getConnections";
import { sendMessage } from "~/server/trpc/procedures/sendMessage";
import { getMessages } from "~/server/trpc/procedures/getMessages";

export const appRouter = createTRPCRouter({
  register,
  login,
  getCurrentUser,
  createPost,
  getFeed,
  getJobPostings,
  likePost,
  addComment,
  getMinioBaseUrl,
  createOrganization,
  createJobPosting,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
  getUserOrganizations,
  getMinioPresignedUrlForResumeUpload,
  sendConnectionRequest,
  respondToConnectionRequest,
  getConnectionRequests,
  getConnections,
  sendMessage,
  getMessages,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
