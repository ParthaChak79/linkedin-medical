import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const sendConnectionRequest = baseProcedure
  .input(z.object({ 
    authToken: z.string(),
    receiverId: z.number()
  }))
  .mutation(async ({ input }) => {
    try {
      // Verify and parse JWT token
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ userId: z.number() }).parse(verified);
      const requesterId = parsed.userId;

      // Check if user is trying to connect to themselves
      if (requesterId === input.receiverId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot send connection request to yourself",
        });
      }

      // Check if receiver exists
      const receiver = await db.user.findUnique({
        where: { id: input.receiverId },
      });

      if (!receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if connection already exists (in either direction)
      const existingConnection = await db.connection.findFirst({
        where: {
          OR: [
            { requesterId: requesterId, receiverId: input.receiverId },
            { requesterId: input.receiverId, receiverId: requesterId },
          ],
        },
      });

      if (existingConnection) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Connection request already exists or users are already connected",
        });
      }

      // Create connection request
      const connection = await db.connection.create({
        data: {
          requesterId: requesterId,
          receiverId: input.receiverId,
          status: "pending",
        },
        include: {
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalProfile: {
                select: {
                  professionType: true,
                  specialty: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        connection,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
  });
