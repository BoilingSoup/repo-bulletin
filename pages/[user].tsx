import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Image,
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
import { newBulletin, newSection } from "../components/helpers";
import { usePublicContributions } from "../hooks/usePublicContributions";
import { SortableSection } from "../components/SortableSection";
import { useImmer } from "use-immer";

const User: NextPage = () => {
  const { account, isFetched: accountIsFetched } = useAuth();

  const router = useRouter();
  const user = router.query.user as string | undefined;
  console.log(user);
  const [notFound, setNotFound] = useState<boolean | undefined>(undefined);

  const [bulletinClientData, setBulletinClientData] = useImmer<
    Exclude<Bulletin, null> | undefined
  >(undefined);

  // get avatar & id from github
  const { data: githubData, isFetched: githubIsFetched } = useGithub({
    user: user as string | undefined,
    setNotFound,
    enabled: user !== undefined,
  });
  // get public repos from github
  const { data: contributions, isFetched: publicContributionsFetched } =
    usePublicContributions({
      user: user as string | undefined,
      enabled: user !== undefined,
    });

  // use github user id to check if there is bulletin in DB
  const { data: bulletinServerData, isFetched: bulletinIsFetched } =
    useBulletin({
      id: githubData?.id,
      setNotFound,
      setBulletinClientData: setBulletinClientData,
      enabled:
        githubIsFetched && publicContributionsFetched && notFound !== true,
    });

  const isMyPage = account?.name.toLowerCase() === user?.toLowerCase();
  const isValidEditMode = isMyPage && router.query.edit === "true";

  const atLeastOneSectionHasNoNameOrRepos =
    bulletinClientData?.sections === undefined ||
    bulletinClientData.sections.some((section) => section.name.trim() === "") ||
    bulletinClientData.sections.some((section) => section.repos.length === 0);

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
        {accountIsFetched &&
          bulletinServerData === null &&
          githubIsFetched &&
          !isValidEditMode && (
            <Center w="100%" h="100%">
              <Stack>
                <Image
                  src={githubData?.avatar_url}
                  height={200}
                  width={200}
                  mx="auto"
                  radius={9999}
                />

                <Text
                  color="dark.1"
                  size="clamp(2rem, 6vw, 3rem)"
                  align="center"
                >
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
                    onClick={() => setBulletinClientData(newBulletin())}
                  >
                    Edit My Page
                  </Button>
                )}
              </Stack>
            </Center>
          )}
        {isValidEditMode && githubIsFetched && (
          <Container>
            <Flex
              justify={"space-between"}
              sx={(theme) => ({
                position: "sticky",
                height: NAVBAR_HEIGHT,
                zIndex: 9999999,
                background: theme.colors.github[9],
                top: NAVBAR_HEIGHT,
              })}
            >
              <Button
                my="md"
                color="lime.9"
                onClick={() =>
                  setBulletinClientData((prev) => {
                    if (prev === undefined) return prev;
                    prev.sections.push(newSection());
                  })
                }
                disabled={atLeastOneSectionHasNoNameOrRepos}
                sx={(theme) => ({
                  ":disabled": {
                    background: theme.colors.dark[8],
                    color: theme.colors.dark[4],
                  },
                })}
              >
                <Flex mr="3px" align="center">
                  <IconPlus />
                </Flex>
                Add Section
              </Button>
              <Group my="md">
                <Button w="90px" variant="gradient">
                  Save All
                </Button>
                <Button
                  w="90px"
                  color="dark.3"
                  onClick={() => {
                    setBulletinClientData(bulletinServerData!);
                    router.push(`/${user}`);
                  }}
                >
                  Cancel
                </Button>
              </Group>
            </Flex>
            <Box pt={30}></Box>
            {publicContributionsFetched &&
              bulletinClientData?.sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  contributions={contributions}
                  onChange={setBulletinClientData}
                  user={user}
                />
              ))}
          </Container>
        )}
      </Box>
    </>
  );
};

export default User;
