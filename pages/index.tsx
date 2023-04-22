import type { NextPage } from "next";
import Head from "next/head";
import { Container, Center, Text, Button } from "@mantine/core";
import { useAuth } from "../contexts/AuthProvider";
import Link from "next/link";

const Home: NextPage = () => {
  const { account, isLoading } = useAuth();

  return (
    <>
      <Head>
        <title>test</title>
      </Head>
      <Center
        sx={(theme) => ({
          width: "100vw",
          height: "100vh",
          background: theme.colors.github[9],
        })}
      >
        <Text color="dark.1" size="4rem">
          Show off your repos.
        </Text>
        {account ? (
          <Button component={Link} href={`/${account.name}`}>
            View My Page
          </Button>
        ) : (
          <Button>Login with GitHub</Button>
        )}
      </Center>
    </>
  );
};

export default Home;
