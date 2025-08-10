import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  medicalProfile: {
    id: number;
    professionType: string;
    specialty: string;
    yearsOfExperience: number;
    licenseNumber: string | null;
    currentPosition: string | null;
    bio: string | null;
    profilePictureUrl: string | null;
    location: string | null;
  } | null;
};

type AuthStore = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token: string, user: User) => {
        set({ token, user });
      },
      clearAuth: () => {
        set({ token: null, user: null });
      },
      isAuthenticated: () => {
        const { token } = get();
        return token !== null;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
