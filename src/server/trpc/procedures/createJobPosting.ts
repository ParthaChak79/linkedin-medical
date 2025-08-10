import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const createJobPosting = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      organizationId: z.number(),
      title: z.string().min(1),
      description: z.string().min(1),
      requirements: z.string().min(1),
      salary: z.string().optional(),
      location: z.string().min(1),
      jobType: z.string().min(1),
      specialty: z.string().min(1),
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

    // Check if user is an admin of the organization
    const membership = await db.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: userId,
          organizationId: input.organizationId,
        },
      },
    });

    if (!membership || membership.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to post jobs for this organization",
      });
    }

    // Create job posting
    const jobPosting = await db.jobPosting.create({
      data: {
        title: input.title,
        description: input.description,
        requirements: input.requirements,
        salary: input.salary,
        location: input.location,
        jobType: input.jobType,
        specialty: input.specialty,
        organizationId: input.organizationId,
      },
      include: {
        organization: true,
      },
    });

    return {
      jobPosting,
      success: true,
    };
  });
