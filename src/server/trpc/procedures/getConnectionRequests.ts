import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const getConnectionRequests = baseProcedure
  .input(z.object({ authToken: z.string() }))
  .query(async ({ input }) => {
    try {
      // Verify and parse JWT token
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ userId: z.number() }).parse(verified);
      const userId = parsed.userId;

      // Get incoming connection requests (where user is the receiver)
      const incomingRequests = await db.connection.findMany({
        where: {
          receiverId: userId,
          status: "pending",
        },
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
                  location: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Get outgoing connection requests (where user is the requester)
      const outgoingRequests = await db.connection.findMany({
        where: {
          requesterId: userId,
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
                  location: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        incoming: incomingRequests,
        outgoing: outgoingRequests,
      };
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
  });
