import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const sendMessage = baseProcedure
  .input(z.object({ 
    authToken: z.string(),
    receiverId: z.number(),
    content: z.string().min(1, "Message cannot be empty")
  }))
  .mutation(async ({ input }) => {
    try {
      // Verify and parse JWT token
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ userId: z.number() }).parse(verified);
      const senderId = parsed.userId;

      // Check if user is trying to message themselves
      if (senderId === input.receiverId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot send message to yourself",
        });
      }

      // Check if users are connected
      const connection = await db.connection.findFirst({
        where: {
          OR: [
            { requesterId: senderId, receiverId: input.receiverId },
            { requesterId: input.receiverId, receiverId: senderId },
          ],
          status: "accepted",
        },
      });

      if (!connection) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only send messages to your connections",
        });
      }

      // Create the message
      const message = await db.message.create({
        data: {
          senderId: senderId,
          receiverId: input.receiverId,
          content: input.content,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalProfile: {
                select: {
                  profilePictureUrl: true,
                },
              },
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return {
        success: true,
        message,
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
