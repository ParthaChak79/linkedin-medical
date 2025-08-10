import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TRPCReactProvider } from "~/trpc/react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  return (
    <TRPCReactProvider>
      {isFetching ? (
        <div>Loading...</div>
      ) : (
        <Outlet />
      )}
    </TRPCReactProvider>
  );
}
