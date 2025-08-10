import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getFeed = baseProcedure
  .input(
    z.object({
      cursor: z.number().optional(),
      limit: z.number().min(1).max(50).default(10),
    })
  )
  .query(async ({ input }) => {
    const posts = await db.post.findMany({
      take: input.limit + 1, // Take one extra to determine if there's a next page
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          include: {
            medicalProfile: true,
          },
        },
        likes: {
          include: {
            user: true,
          },
        },
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

    let nextCursor: number | undefined = undefined;
    if (posts.length > input.limit) {
      const nextItem = posts.pop(); // Remove the extra item
      nextCursor = nextItem!.id;
    }

    return {
      posts,
      nextCursor,
    };
  });
