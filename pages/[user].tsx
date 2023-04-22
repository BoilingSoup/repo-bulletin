import { Box, Button, Center, Image, Stack, Text } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useBulletin } from "../hooks/useBulletin";
import { useState } from "react";
import { IconMoodSmileDizzy, IconPencil } from "@tabler/icons-react";
import { useGithub } from "../hooks/useGithub";
import { useAuth } from "../contexts/AuthProvider";
import Link from "next/link";

const User: NextPage = () => {
  const { account } = useAuth();
  const router = useRouter();
  const user = router.query.user as string | undefined;
  const [notFound, setNotFound] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useBulletin({
    user: user as string | undefined,
    setNotFound,
  });
  const { data: githubData, isFetched } = useGithub({
    user: user as string | undefined,
    enabled: notFound,
  });

  const isMyPage = account?.name.toLowerCase() === user?.toLowerCase();
  const isValidEditMode = isMyPage && router.query.edit === "true";
  console.log(isValidEditMode);

  return (
    <>
      <Box
        sx={(theme) => ({
          width: "100vw",
          height: "100vh",
          background: theme.colors.github[9],
        })}
      >
        {notFound && (
          <Center w="100%" h="100%">
            <Stack>
              <Text color="dark.0" size="8rem">
                404
                <IconMoodSmileDizzy size={100} />
              </Text>
              <Text color="dark.1" size="4rem" align="center">
                This user doesn't exist.
              </Text>
            </Stack>
          </Center>
        )}
        {data === null && isFetched && !isValidEditMode && (
          <Center w="100%" h="100%">
            <Stack>
              <Image
                src={githubData?.avatar_url}
                height={200}
                width={200}
                mx="auto"
                radius={9999}
              />

              <Text color="dark.1" size="clamp(2rem, 6vw, 3rem)" align="center">
                {`${user}'s bulletin is empty!`}
              </Text>
              {isMyPage && (
                <Button
                  h="60px"
                  w="300px"
                  my="60px"
                  mx="auto"
                  variant="gradient"
                  leftIcon={<IconPencil />}
                  size="lg"
                  component={Link}
                  href={`/${user}?edit=true`}
                >
                  Edit My Page
                </Button>
              )}
            </Stack>
          </Center>
        )}
      </Box>
    </>
  );
};

export default User;
