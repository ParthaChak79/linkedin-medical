import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const addComment = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      postId: z.number(),
      content: z.string().min(1).max(500),
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

      // Create the comment
      const comment = await db.comment.create({
        data: {
          content: input.content,
          userId: parsed.userId,
          postId: input.postId,
        },
        include: {
          user: {
            include: {
              medicalProfile: true,
            },
          },
        },
      });

      return comment;
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
