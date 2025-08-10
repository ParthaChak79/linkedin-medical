import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "~/server/trpc/main";
import { minioClient } from "~/server/minio";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const getMinioPresignedUrlForResumeUpload = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      fileName: z.string(),
      contentType: z.string(),
    })
  )
  .query(async ({ input }) => {
    // Verify auth token
    let userId: number;
    try {
      const decoded = jwt.verify(input.authToken, env.JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid auth token",
      });
    }

    // Generate unique filename with user prefix
    const timestamp = Date.now();
    const fileExtension = input.fileName.split('.').pop();
    const uniqueFileName = `user-${userId}/${timestamp}-${input.fileName}`;

    // Generate presigned URL for upload
    const presignedUrl = await minioClient.presignedPutObject(
      "resumes",
      uniqueFileName,
      24 * 60 * 60, // 24 hours expiry
      {
        "Content-Type": input.contentType,
      }
    );

    return {
      presignedUrl,
      fileName: uniqueFileName,
    };
  });
