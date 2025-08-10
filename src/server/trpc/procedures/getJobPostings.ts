import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getJobPostings = baseProcedure
  .input(
    z.object({
      cursor: z.number().optional(),
      limit: z.number().min(1).max(50).default(10),
      specialty: z.string().optional(),
      location: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const where: any = {
      isActive: true,
    };

    if (input.specialty) {
      where.specialty = {
        contains: input.specialty,
        mode: "insensitive",
      };
    }

    if (input.location) {
      where.location = {
        contains: input.location,
        mode: "insensitive",
      };
    }

    const jobPostings = await db.jobPosting.findMany({
      take: input.limit + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        organization: true,
        applications: true,
      },
    });

    let nextCursor: number | undefined = undefined;
    if (jobPostings.length > input.limit) {
      const nextItem = jobPostings.pop();
      nextCursor = nextItem!.id;
    }

    return {
      jobPostings,
      nextCursor,
    };
  });
