import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Image,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Bulletin, useBulletin } from "../hooks/useBulletin";
import { useState } from "react";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useGithub } from "../hooks/useGithub";
import { useAuth } from "../contexts/AuthProvider";
import Link from "next/link";
import { NAVBAR_HEIGHT } from "../components/styles";
import { NotFound } from "../components/NotFound";
import { newBulletin } from "../components/helpers";

const User: NextPage = () => {
  const { account, isFetched } = useAuth();

  const router = useRouter();
  const user = router.query.user as string | undefined;
  const [notFound, setNotFound] = useState<boolean | undefined>(undefined);

  const [bulletin, setBulletin] = useState<Exclude<Bulletin, null> | undefined>(
    undefined
  );

  const { data: bulletinData } = useBulletin({
    user: user as string | undefined,
    setNotFound,
    setBulletin,
    enabled: isFetched,
  });
  const { data: githubData, isFetched: githubIsFetched } = useGithub({
    user: user as string | undefined,
    enabled: notFound,
  });

  const isMyPage = account?.name.toLowerCase() === user?.toLowerCase();
  const isValidEditMode = isMyPage && router.query.edit === "true";

  // console.log(bulletin);
  return (
    <>
      <Box
        sx={(theme) => ({
          width: "100vw",
          height: "100vh",
          background: theme.colors.github[9],
        })}
        pt={NAVBAR_HEIGHT}
      >
        {notFound && <NotFound />}
        {bulletinData === null && githubIsFetched && !isValidEditMode && (
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
                  onClick={() => setBulletin(newBulletin())}
                >
                  Edit My Page
                </Button>
              )}
            </Stack>
          </Center>
        )}
        {isValidEditMode && (
          <Container>
            <Flex justify={"flex-end"}>
              <Group my="md">
                <Button w="90px" variant="gradient">
                  Save
                </Button>
                <Button w="90px" color="dark.3">
                  Cancel
                </Button>
              </Group>
            </Flex>
            {bulletin?.sections.map((section) => (
              <Paper
                key={section.id}
                sx={(theme) => ({
                  background: theme.colors.github[7],
                  padding: theme.spacing.lg,
                  borderRadius: theme.radius.lg,
                })}
              >
                <Text
                  color="dark.0"
                  size="2rem"
                  component="h1"
                  sx={(theme) => ({
                    border: `1px dashed ${theme.colors.dark[2]}`,
                    borderRadius: theme.radius.lg,
                  })}
                >
                  {section.name}
                </Text>
                {section.repos.length === 0 && (
                  <Center
                    h="200px"
                    w="100%"
                    sx={(theme) => ({
                      border: `1px dashed ${theme.colors.dark[2]}`,
                      borderRadius: theme.radius.lg,
                    })}
                  >
                    <Button
                      bg="none"
                      leftIcon={<IconPlus />}
                      sx={{
                        ":hover": {
                          background: "none",
                        },
                      }}
                    >
                      Add Repos
                    </Button>
                  </Center>
                )}
                <Paper>{section.repos}</Paper>
              </Paper>
            ))}
            {/* <Button leftIcon={<IconPlus />}>New Section</Button> */}
            {/* <Text color="white">{JSON.stringify(bulletin)}</Text> */}
          </Container>
        )}
      </Box>
    </>
  );
};

export default User;
