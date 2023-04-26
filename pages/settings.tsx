import { Box, Button, Center, Group, Loader, Stack, Text } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { useDeleteAccountMutation } from "../hooks/useDeleteAccountMutation";

const Settings: NextPage = () => {
  const router = useRouter();
  const { account, isLoading, isFetched } = useAuth();
  const { mutate: deleteAccount, isLoading: isDeleting } =
    useDeleteAccountMutation();

  useEffect(() => {
    if (isFetched && !account) {
      router.push("/");
    }
  }, [router, isFetched, account]);

  return (
    <Center bg="github.9" h="100vh" w="100vw">
      {(isLoading || isDeleting) && (
        <Center
          h="100vh"
          w="100vw"
          sx={{ background: "rgba(0, 0, 0, 0.5)", zIndex: 9999 }}
          pos="absolute"
          top={0}
          left={0}
        >
          <Loader />
        </Center>
      )}
      {!isLoading && (
        <Stack>
          <Text color="white" size="3rem" align="center">
            Delete your account?
          </Text>
          <Group>
            <Button
              w="200px"
              h="60px"
              m="auto"
              sx={{ fontSize: "2rem" }}
              onClick={() => deleteAccount()}
            >
              Yes
            </Button>
            <Button
              w="200px"
              h="60px"
              m="auto"
              sx={(theme) => ({
                fontSize: "2rem",
                backgroundColor: theme.colors.red[5],
                ":hover": {
                  backgroundColor: theme.colors.red[6],
                },
              })}
              onClick={() => router.push("/")}
            >
              No
            </Button>
          </Group>
        </Stack>
      )}
    </Center>
  );
};

export default Settings;
