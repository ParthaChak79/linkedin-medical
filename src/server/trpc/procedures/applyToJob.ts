import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const applyToJob = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      jobPostingId: z.number(),
      coverLetter: z.string().optional(),
      resumeUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Verify auth token
    let userId: number;
    try {
      const decoded = jwt.verify(input.authToken, env.JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid auth token",
      });
    }

    // Check if user exists and has medical profile
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { medicalProfile: true },
    });

    if (!user || !user.medicalProfile) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found or not a medical professional",
      });
    }

    // Check if job posting exists and is active
    const jobPosting = await db.jobPosting.findUnique({
      where: { id: input.jobPostingId },
    });

    if (!jobPosting || !jobPosting.isActive) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job posting not found or no longer active",
      });
    }

    // Check if user has already applied
    const existingApplication = await db.application.findUnique({
      where: {
        userId_jobPostingId: {
          userId: userId,
          jobPostingId: input.jobPostingId,
        },
      },
    });

    if (existingApplication) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "You have already applied to this job",
      });
    }

    // Create application
    const application = await db.application.create({
      data: {
        userId: userId,
        jobPostingId: input.jobPostingId,
        coverLetter: input.coverLetter,
        resumeUrl: input.resumeUrl,
        status: "pending",
      },
      include: {
        jobPosting: {
          include: {
            organization: true,
          },
        },
        user: {
          include: {
            medicalProfile: true,
          },
        },
      },
    });

    return {
      application,
      success: true,
    };
  });
