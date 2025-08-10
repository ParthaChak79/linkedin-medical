import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const createPost = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      content: z.string().min(1).max(2000),
      imageUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Verify and parse JWT token
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ userId: z.number() }).parse(verified);

      // Create the post
      const post = await db.post.create({
        data: {
          content: input.content,
          imageUrl: input.imageUrl,
          authorId: parsed.userId,
        },
        include: {
          author: {
            include: {
              medicalProfile: true,
            },
          },
          likes: true,
          comments: {
            include: {
              user: {
                include: {
                  medicalProfile: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return post;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        });
      }
      throw error;
    }
  });
