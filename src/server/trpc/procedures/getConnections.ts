import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const getConnections = baseProcedure
  .input(z.object({ authToken: z.string() }))
  .query(async ({ input }) => {
    try {
      // Verify and parse JWT token
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ userId: z.number() }).parse(verified);
      const userId = parsed.userId;

      // Get all accepted connections where user is involved
      const connections = await db.connection.findMany({
        where: {
          OR: [
            { requesterId: userId },
            { receiverId: userId },
          ],
          status: "accepted",
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
                  currentPosition: true,
                },
              },
            },
          },
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
                  currentPosition: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform the data to always show the "other" user
      const transformedConnections = connections.map((connection) => {
        const isRequester = connection.requesterId === userId;
        const connectedUser = isRequester ? connection.receiver : connection.requester;
        
        return {
          id: connection.id,
          connectedUser,
          connectedAt: connection.createdAt,
        };
      });

      return transformedConnections;
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
  });
