import { Box, Text } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";

const User: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Box
        sx={(theme) => ({
          width: "100vw",
          height: "100vh",
          background: theme.colors.github[9],
        })}
      >
        <Text color="dark.3">{JSON.stringify(router.query)}</Text>
      </Box>
    </>
  );
};

export default User;
