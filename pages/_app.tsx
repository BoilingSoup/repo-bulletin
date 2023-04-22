import { MantineProvider } from "@mantine/core";
import type { AppProps } from "next/app";
import { AuthProvider } from "../contexts/AuthProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Navbar } from "../components/Navbar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colors: {
            github: [
              "#516a90",
              "#496083",
              "#425776",
              "#3b4d68",
              "#33435b",
              "#2c3a4e",
              "#253041",
              "#1d2734",
              "#161d27",
              "#0d1117",
            ],
          },
        }}
      >
        <AuthProvider>
          <Navbar />
          <Component {...pageProps} />
        </AuthProvider>
      </MantineProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
