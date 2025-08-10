import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const createOrganization = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      name: z.string().min(1),
      type: z.string().min(1),
      description: z.string().optional(),
      location: z.string().optional(),
      website: z.string().url().optional(),
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

    // Check if organization name already exists
    const existingOrg = await db.organization.findUnique({
      where: { name: input.name },
    });

    if (existingOrg) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Organization with this name already exists",
      });
    }

    // Create organization and make user an admin in a transaction
    const organization = await db.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          name: input.name,
          type: input.type,
          description: input.description,
          location: input.location,
          website: input.website,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId: userId,
          organizationId: newOrg.id,
          role: "admin",
        },
      });

      return newOrg;
    });

    return {
      organization,
      success: true,
    };
  });
