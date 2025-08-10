import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/authStore";
import { Layout } from "~/components/Layout";
import { useState } from "react";

export const Route = createFileRoute("/register/")({
  component: RegisterPage,
});

type RegisterForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  professionType: string;
  specialty: string;
  yearsOfExperience: number;
  licenseNumber?: string;
  currentPosition?: string;
  bio?: string;
  location?: string;
};

function RegisterPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { setAuth } = useAuthStore();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  const registerMutation = useMutation(
    trpc.register.mutationOptions({
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        navigate({ to: "/feed" });
      },
      onError: (error: any) => {
        setRegisterError(error.message || "Registration failed");
      },
    })
  );

  const onSubmit = (data: RegisterForm) => {
    setRegisterError(null);
    registerMutation.mutate({
      ...data,
      yearsOfExperience: Number(data.yearsOfExperience),
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Join MedConnect
        </h1>

        {registerError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {registerError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                {...register("firstName", { required: "First name is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                {...register("lastName", { required: "Last name is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="professionType"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Profession Type
            </label>
            <select
              id="professionType"
              {...register("professionType", { required: "Profession type is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your profession</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Therapist">Therapist</option>
              <option value="Technician">Technician</option>
              <option value="Administrator">Administrator</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Other">Other</option>
            </select>
            {errors.professionType && (
              <p className="mt-1 text-sm text-red-600">{errors.professionType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="specialty"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Medical Specialty
              </label>
              <select
                id="specialty"
                {...register("specialty", { required: "Specialty is required" })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Family Medicine">Family Medicine</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Neurology">Neurology</option>
                <option value="Nursing">Nursing</option>
                <option value="Oncology">Oncology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Radiology">Radiology</option>
                <option value="Surgery">Surgery</option>
                <option value="Other">Other</option>
              </select>
              {errors.specialty && (
                <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="yearsOfExperience"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Years of Experience
              </label>
              <input
                id="yearsOfExperience"
                type="number"
                min="0"
                {...register("yearsOfExperience", { 
                  required: "Years of experience is required",
                  min: { value: 0, message: "Must be 0 or greater" }
                })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.yearsOfExperience && (
                <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="licenseNumber"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                License Number (Optional)
              </label>
              <input
                id="licenseNumber"
                type="text"
                {...register("licenseNumber")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Location (Optional)
              </label>
              <input
                id="location"
                type="text"
                placeholder="City, State"
                {...register("location")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="currentPosition"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Current Position (Optional)
            </label>
            <input
              id="currentPosition"
              type="text"
              placeholder="e.g., Senior Nurse at City Hospital"
              {...register("currentPosition")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              rows={3}
              placeholder="Tell us about yourself and your medical background..."
              {...register("bio")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-500">
            Login here
          </a>
        </p>
      </div>
    </Layout>
  );
}
