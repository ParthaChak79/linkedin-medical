import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const getMessages = baseProcedure
  .input(z.object({ 
    authToken: z.string(),
    otherUserId: z.number(),
    cursor: z.number().optional(), // for pagination
    limit: z.number().min(1).max(100).default(50)
  }))
  .query(async ({ input }) => {
    try {
      // Verify and parse JWT token
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ userId: z.number() }).parse(verified);
      const userId = parsed.userId;

      // Check if users are connected
      const connection = await db.connection.findFirst({
        where: {
          OR: [
            { requesterId: userId, receiverId: input.otherUserId },
            { requesterId: input.otherUserId, receiverId: userId },
          ],
          status: "accepted",
        },
      });

      if (!connection) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view messages with your connections",
        });
      }

      // Get messages between the two users
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: input.otherUserId },
            { senderId: input.otherUserId, receiverId: userId },
          ],
          ...(input.cursor && {
            id: {
              lt: input.cursor,
            },
          }),
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
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit + 1, // Take one extra to determine if there are more
      });

      // Mark messages as read if they were sent to the current user
      const unreadMessageIds = messages
        .filter(msg => msg.receiverId === userId && !msg.isRead)
        .map(msg => msg.id);

      if (unreadMessageIds.length > 0) {
        await db.message.updateMany({
          where: {
            id: {
              in: unreadMessageIds,
            },
          },
          data: {
            isRead: true,
          },
        });
      }

      // Check if there are more messages
      let nextCursor: number | undefined = undefined;
      if (messages.length > input.limit) {
        const nextItem = messages.pop(); // Remove the extra item
        nextCursor = nextItem!.id;
      }

      // Reverse to show oldest first
      const orderedMessages = messages.reverse();

      return {
        messages: orderedMessages,
        nextCursor,
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
