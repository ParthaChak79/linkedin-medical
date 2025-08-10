import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const likePost = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      postId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Verify and parse JWT token
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ userId: z.number() }).parse(verified);

      // Check if post exists
      const post = await db.post.findUnique({
        where: { id: input.postId },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      // Check if user already liked the post
      const existingLike = await db.like.findUnique({
        where: {
          userId_postId: {
            userId: parsed.userId,
            postId: input.postId,
          },
        },
      });

      if (existingLike) {
        // Unlike the post
        await db.like.delete({
          where: {
            userId_postId: {
              userId: parsed.userId,
              postId: input.postId,
            },
          },
        });
        return { liked: false };
      } else {
        // Like the post
        await db.like.create({
          data: {
            userId: parsed.userId,
            postId: input.postId,
          },
        });
        return { liked: true };
      }
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
