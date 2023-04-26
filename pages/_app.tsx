import { MantineProvider, createEmotionCache } from "@mantine/core";
import type { AppProps } from "next/app";
import { AuthProvider } from "../contexts/AuthProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Navbar } from "../components/Navbar";
import "../public/styles.css";
import { ConfirmedDeleteStatusProvider } from "../contexts/HasConfirmedProvider";
import Head from "next/head";

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

export const cssCache = createEmotionCache({ key: "mantine" });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Repobullet.in</title>
        <meta
          name="description"
          content="Simple drag & drop page builder for your public repos. Pin your repos, organize repos into sections. Get started in seconds."
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          emotionCache={cssCache}
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
            <ConfirmedDeleteStatusProvider>
              <Navbar />
              <Component {...pageProps} />
            </ConfirmedDeleteStatusProvider>
          </AuthProvider>
        </MantineProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
