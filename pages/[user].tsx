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
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Bulletin, Section, useBulletin } from "../hooks/useBulletin";
import { useEffect, useRef, useState } from "react";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useGithub } from "../hooks/useGithub";
import { useAuth } from "../contexts/AuthProvider";
import Link from "next/link";
import { NAVBAR_HEIGHT } from "../components/styles";
import { NotFound } from "../components/NotFound";
import { newBulletin, newSection } from "../components/helpers";
import {
  PublicContribution,
  usePublicContributions,
} from "../hooks/usePublicContributions";
import { SortableSection } from "../components/SortableSection";
import { useImmer } from "use-immer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arraySwap,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQueryClient } from "react-query";
import { SortableRepo } from "../components/SortableRepo";

const User: NextPage = () => {
  const { account, isFetched: accountIsFetched } = useAuth();

  const router = useRouter();
  const user = router.query.user as string | undefined;
  const [notFound, setNotFound] = useState<boolean | undefined>(undefined);

  const [bulletinClientData, setBulletinClientData] = useImmer<
    Exclude<Bulletin, null> | undefined
  >(undefined);
  console.log(bulletinClientData);

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

  const atLeastOneSectionHasNoName = bulletinClientData?.sections.some(
    (section) => section.name.trim() === ""
  );
  const atLeastOneSectionHasNoRepos = bulletinClientData?.sections.some(
    (section) => section.repos.length === 0
  );

  const atLeastOneSectionHasNoNameOrRepos =
    bulletinClientData?.sections === undefined ||
    atLeastOneSectionHasNoName ||
    atLeastOneSectionHasNoRepos;

  let warningText: string;
  if (atLeastOneSectionHasNoName) {
    warningText = "Section title must not be blank.";
  } else if (atLeastOneSectionHasNoRepos) {
    warningText = "All sections must have at least 1 repo.";
  } else {
    warningText = "";
  }

  const [parent /*, enableAnimations*/] = useAutoAnimate();
  const [reposAnimateRef, enableReposAutoAnimate] = useAutoAnimate();

  const [dragActiveItem, setDragActiveItem] = useState<
    Section | PublicContribution | null
  >(null);
  const queryClient = useQueryClient();

  const handleDragStart = (event: DragStartEvent) => {
    enableReposAutoAnimate(false);
    const draggableType = event.active.data.current?.type as "SECTION" | "REPO";
    if (draggableType === "SECTION") {
      const sectionIndex = bulletinClientData?.sections.findIndex(
        (section) => section.id === event.active.id
      ) as number;
      const section = bulletinClientData?.sections[sectionIndex];
      setDragActiveItem(section as Section);
      return;
    }

    if (draggableType === "REPO") {
      const contributions = queryClient.getQueryData([
        "contributions",
        user?.toLowerCase(),
      ]) as PublicContribution[];

      const contributionObjIndex = contributions.findIndex(
        (contribution) => contribution.id === event.active.data.current?.repoID
      );
      const contribution = contributions[contributionObjIndex];
      setDragActiveItem(contribution);
      return;
    }
  };
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeDraggableType = active.data.current?.type as "SECTION" | "REPO";
    const overDraggableType = over?.data.current?.type as "SECTION" | "REPO";

    if (over === null || activeDraggableType !== overDraggableType) {
      return;
    }

    if (
      activeDraggableType === "REPO" &&
      active.data.current?.sectionID !== over.data.current?.sectionID
    ) {
      return;
    }

    const isSectionOnSection = activeDraggableType === "SECTION";
    if (isSectionOnSection) {
      setBulletinClientData((prev) => {
        if (prev === undefined) {
          return prev;
        }
        const activeSectionIndex = prev.sections.findIndex(
          (section) => section.id === active.id
        );
        const overIndex = prev.sections.findIndex(
          (section) => section.id === over.id
        );
        prev.sections = arraySwap(prev.sections, activeSectionIndex, overIndex);
      });
      return;
    }

    const isRepoOnRepo = activeDraggableType === "REPO";
    if (isRepoOnRepo) {
      setBulletinClientData((prev) => {
        if (prev === undefined) {
          return prev;
        }
        const dragOverSectionIndex = prev.sections.findIndex(
          (section) => section.id === active.data.current?.sectionID
        );
        const dragOverSection = prev.sections[dragOverSectionIndex];
        const activeItemIndex = dragOverSection.repos.findIndex(
          (repo) => repo.id === active.id
        );
        const overItemIndex = dragOverSection.repos.findIndex(
          (repo) => repo.id === over.id
        );

        dragOverSection.repos = arraySwap(
          dragOverSection.repos,
          activeItemIndex,
          overItemIndex
        );
      });
      return;
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    enableReposAutoAnimate(true);
    setDragActiveItem(null);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Box
        sx={(theme) => ({
          width: "100vw",
          height: "100vh",
          background: theme.colors.github[9],
          overflowX: "hidden",
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
                top: 0,
              })}
              ref={containerRef}
            >
              <Flex>
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
              </Flex>
              {warningText !== "" && (
                <Text my="xl" color="yellow.2" span>
                  {warningText}
                </Text>
              )}

              <Group my="md">
                <Button
                  w="90px"
                  variant="gradient"
                  disabled={warningText !== ""}
                  sx={(theme) => ({
                    ":disabled": {
                      background: theme.colors.dark[8],
                      color: theme.colors.dark[4],
                    },
                  })}
                >
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
            <DndContext
              id="dnd"
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={
                  bulletinClientData?.sections.map((section) => section.id) ?? [
                    "ZZZZZ",
                  ]
                }
                strategy={verticalListSortingStrategy}
              >
                <Box ref={parent}>
                  {publicContributionsFetched &&
                    bulletinClientData?.sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        contributions={contributions}
                        onChange={setBulletinClientData}
                        user={user}
                        animateReposRef={reposAnimateRef}
                      />
                    ))}
                </Box>
              </SortableContext>
              <DragOverlay>
                {dragActiveItem !== null &&
                  typeof dragActiveItem.id === "string" && (
                    <SortableSection
                      animateReposRef={reposAnimateRef}
                      section={(() => {
                        const draggedSectionIndex =
                          bulletinClientData!.sections.findIndex(
                            (section) => section.id === dragActiveItem.id
                          );
                        const draggedSection =
                          bulletinClientData!.sections[draggedSectionIndex];
                        return draggedSection;
                      })()}
                      contributions={contributions}
                      onChange={setBulletinClientData}
                      user={user}
                    />
                  )}
                {dragActiveItem !== null &&
                  typeof dragActiveItem.id === "number" && (
                    <SortableRepo
                      contribution={dragActiveItem as PublicContribution}
                      onRemove={() => {}}
                      mediaQueryWidth={(() => {
                        const xPadding = 40;
                        return `${
                          (containerRef.current!.offsetWidth - xPadding) * 0.49
                        }px`;
                      })()}
                    />
                  )}
              </DragOverlay>
            </DndContext>
          </Container>
        )}
      </Box>
    </>
  );
};

export default User;
