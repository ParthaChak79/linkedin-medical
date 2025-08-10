import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const respondToConnectionRequest = baseProcedure
  .input(z.object({ 
    authToken: z.string(),
    connectionId: z.number(),
    response: z.enum(["accepted", "rejected"])
  }))
  .mutation(async ({ input }) => {
    try {
      // Verify and parse JWT token
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ userId: z.number() }).parse(verified);
      const userId = parsed.userId;

      // Find the connection request
      const connection = await db.connection.findUnique({
        where: { id: input.connectionId },
        include: {
          requester: {
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

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection request not found",
        });
      }

      // Verify that the current user is the receiver of this request
      if (connection.receiverId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only respond to connection requests sent to you",
        });
      }

      // Verify that the request is still pending
      if (connection.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This connection request has already been responded to",
        });
      }

      // Update the connection status
      const updatedConnection = await db.connection.update({
        where: { id: input.connectionId },
        data: { status: input.response },
        include: {
          requester: {
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
        connection: updatedConnection,
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
