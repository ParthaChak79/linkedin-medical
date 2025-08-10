import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export const register = baseProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      professionType: z.string().min(1),
      specialty: z.string().min(1),
      yearsOfExperience: z.number().min(0),
      licenseNumber: z.string().optional(),
      currentPosition: z.string().optional(),
      bio: z.string().optional(),
      location: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user and medical profile in a transaction
    const user = await db.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        medicalProfile: {
          create: {
            professionType: input.professionType,
            specialty: input.specialty,
            yearsOfExperience: input.yearsOfExperience,
            licenseNumber: input.licenseNumber,
            currentPosition: input.currentPosition,
            bio: input.bio,
            location: input.location,
          },
        },
      },
      include: {
        medicalProfile: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "1y",
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        medicalProfile: user.medicalProfile,
      },
    };
  });
