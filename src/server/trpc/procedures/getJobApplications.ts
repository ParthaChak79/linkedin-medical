import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const getJobApplications = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      jobPostingId: z.number(),
    })
  )
  .query(async ({ input }) => {
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

    // Get job posting and verify user has permission to view applications
    const jobPosting = await db.jobPosting.findUnique({
      where: { id: input.jobPostingId },
      include: {
        organization: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!jobPosting) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Job posting not found",
      });
    }

    // Check if user is an admin of the organization
    const isAdmin = jobPosting.organization.members.some(
      (member) => member.userId === userId && member.role === "admin"
    );

    if (!isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to view applications for this job",
      });
    }

    // Get applications with user details
    const applications = await db.application.findMany({
      where: {
        jobPostingId: input.jobPostingId,
      },
      include: {
        user: {
          include: {
            medicalProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      applications,
      jobPosting,
    };
  });
