import type { NextPage } from "next";
import Head from "next/head";
import { Container } from "@mantine/core";
import { useAuth } from "../contexts/AuthProvider";

const Home: NextPage = () => {
  const { account, setAccount, isLoading } = useAuth();

  if (isLoading) return <div>loading...........</div>;

  return (
    <>
      <Head>
        <title>test</title>
      </Head>
      <Container>{JSON.stringify(account)}</Container>
    </>
  );
};

export default Home;
