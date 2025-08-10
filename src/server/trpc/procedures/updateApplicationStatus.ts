import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const updateApplicationStatus = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      applicationId: z.number(),
      status: z.enum(["pending", "reviewed", "accepted", "rejected"]),
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

    // Get application with job posting and organization details
    const application = await db.application.findUnique({
      where: { id: input.applicationId },
      include: {
        jobPosting: {
          include: {
            organization: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Application not found",
      });
    }

    // Check if user is an admin of the organization
    const isAdmin = application.jobPosting.organization.members.some(
      (member) => member.userId === userId && member.role === "admin"
    );

    if (!isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to update this application",
      });
    }

    // Update application status
    const updatedApplication = await db.application.update({
      where: { id: input.applicationId },
      data: { status: input.status },
      include: {
        user: {
          include: {
            medicalProfile: true,
          },
        },
        jobPosting: {
          include: {
            organization: true,
          },
        },
      },
    });

    return {
      application: updatedApplication,
      success: true,
    };
  });
