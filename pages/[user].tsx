import { Box, Button, Center, Container, Flex, Group, Image, Loader, Paper, Stack, Text } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Bulletin, Section, useBulletin } from "../hooks/useBulletin";
import { Fragment, useEffect, useRef, useState } from "react";
import { IconDeviceFloppy, IconPencil, IconPlus, IconSquareLetterX, IconStar } from "@tabler/icons-react";
import { useGithub } from "../hooks/useGithub";
import { useAuth } from "../contexts/AuthProvider";
import Link from "next/link";
import {
  BREAKPOINT_LG,
  BREAKPOINT_MD,
  BREAKPOINT_SM,
  NAVBAR_HEIGHT,
  addSectionBtnSx,
  btnGroupSx,
  cancelBtnSx,
  editBarSx,
  editBtnSx,
  emptyTextSx,
  pageContainerSx,
  pageEditBtnSx,
  pageEditTextSx,
  pageLoaderContainerSx,
  repoCardSx,
  repoDescriptionSx,
  repoDetailsTextSx,
  repoLanguageColorSx,
  repoLanguageSx,
  repoNameSx,
  repoStarsTextSx,
  saveBtnSx,
  sectionContainerSx,
  sectionNameSx,
  userImageSx,
  warningTextSx,
} from "../components/styles";
import { NotFound } from "../components/NotFound";
import { languageColors, newBulletin, newSection } from "../components/helpers";
import { PublicContribution, usePublicContributions } from "../hooks/usePublicContributions";
import { SortableSection } from "../components/SortableSection";
import { useImmer } from "use-immer";
import { DndContext, DragOverEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, arraySwap, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useQueryClient } from "react-query";
import { SortableRepo } from "../components/SortableRepo";
import { RepoForkedIcon } from "@primer/octicons-react";
import { useSaveMutation } from "../hooks/useSaveMutation";
import { useViewportSize } from "@mantine/hooks";

const User: NextPage = () => {
  const { account, isFetched: accountIsFetched } = useAuth();

  const router = useRouter();
  const user = router.query.user as string | undefined;
  const [notFound, setNotFound] = useState<boolean | undefined>(undefined);

  const [bulletinClientData, setBulletinClientData] = useImmer<Exclude<Bulletin, null> | undefined>(undefined);

  const isAuthenticated = user !== undefined;

  // get avatar & id from github
  const {
    data: githubData,
    isFetched: githubIsFetched,
    isSuccess: githubFetchWasSuccess,
  } = useGithub({
    user: user as string | undefined,
    setNotFound,
    enabled: isAuthenticated,
  });

  // get public repos from github
  const { data: contributions, isFetched: publicContributionsFetched } = usePublicContributions({
    user: user as string | undefined,
    enabled: isAuthenticated,
  });

  const githubDataIsReady = githubIsFetched && publicContributionsFetched && notFound !== true;

  // use github user id to check if there is bulletin in DB
  const { data: bulletinServerData, isFetched: bulletinIsFetched } = useBulletin({
    id: githubData?.id,
    setNotFound,
    setBulletinClientData,
    enabled: githubDataIsReady,
  });

  const isMyPage = account?.name.toLowerCase() === user?.toLowerCase();
  const isValidEditMode = isMyPage && router.query.edit === "true";

  const atLeastOneSectionHasNoName = bulletinClientData?.sections.some((section) => section.name.trim() === "");
  const atLeastOneSectionHasNoRepos = bulletinClientData?.sections.some((section) => section.repos.length === 0);

  const atLeastOneSectionHasNoNameOrRepos =
    bulletinClientData?.sections === undefined || atLeastOneSectionHasNoName || atLeastOneSectionHasNoRepos;

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

  const [dragActiveItem, setDragActiveItem] = useState<Section | PublicContribution | null>(null);
  const queryClient = useQueryClient();

  const handleDragStart = (event: DragStartEvent) => {
    enableReposAutoAnimate(false);
    const draggableType = event.active.data.current?.type as "SECTION" | "REPO";
    if (draggableType === "SECTION") {
      const sectionIndex = bulletinClientData?.sections.findIndex(
        (section) => section.id === event.active.id,
      ) as number;
      const section = bulletinClientData?.sections[sectionIndex];
      setDragActiveItem(section as Section);
      return;
    }

    if (draggableType === "REPO") {
      const contributions = queryClient.getQueryData(["contributions", user?.toLowerCase()]) as PublicContribution[];

      const contributionObjIndex = contributions.findIndex(
        (contribution) => contribution.id === event.active.data.current?.repoID,
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

    if (activeDraggableType === "REPO" && active.data.current?.sectionID !== over.data.current?.sectionID) {
      return;
    }

    const isSectionOnSection = activeDraggableType === "SECTION";
    if (isSectionOnSection) {
      setBulletinClientData((prev) => {
        if (prev === undefined) {
          return prev;
        }
        const activeSectionIndex = prev.sections.findIndex((section) => section.id === active.id);
        const overIndex = prev.sections.findIndex((section) => section.id === over.id);
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
          (section) => section.id === active.data.current?.sectionID,
        );
        const dragOverSection = prev.sections[dragOverSectionIndex];
        const activeItemIndex = dragOverSection.repos.findIndex((repo) => repo.id === active.id);
        const overItemIndex = dragOverSection.repos.findIndex((repo) => repo.id === over.id);

        dragOverSection.repos = arraySwap(dragOverSection.repos, activeItemIndex, overItemIndex);
      });
      return;
    }
  };

  const handleDragEnd = () => {
    enableReposAutoAnimate(true);
    setDragActiveItem(null);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const { mutate: saveBulletin, isLoading: isSaving } = useSaveMutation({
    id: githubData?.id,
    setBulletinClientData,
  });

  useEffect(() => {
    if (bulletinServerData !== undefined) {
      setBulletinClientData(bulletinServerData!);
    }
  }, [bulletinServerData]);

  const { width } = useViewportSize();

  const userHasNoPinnedRepos = accountIsFetched && bulletinServerData === null && githubIsFetched && !isValidEditMode;
  const userIsEditing = isValidEditMode && githubIsFetched;
  const hasWarning = warningText !== "";
  const saveIsDisabled = hasWarning || isSaving || bulletinClientData?.sections.length === 0;
  const isDraggingSection = dragActiveItem !== null && typeof dragActiveItem.id === "string";
  const isDraggingRepo = dragActiveItem !== null && typeof dragActiveItem.id === "number";
  const isEditable =
    !isValidEditMode && bulletinIsFetched && bulletinServerData !== null && bulletinServerData !== undefined;

  const isScreenXl = width > BREAKPOINT_LG;
  const isScreenLg = width > BREAKPOINT_MD;
  const isScreenMd = width > BREAKPOINT_SM && width <= BREAKPOINT_MD;
  const isScreenSm = width <= BREAKPOINT_SM;

  return (
    <>
      <Box sx={pageContainerSx} pt={NAVBAR_HEIGHT} pb={NAVBAR_HEIGHT}>
        {(isSaving || (githubFetchWasSuccess && bulletinServerData === undefined && !bulletinIsFetched)) && (
          <Center sx={pageLoaderContainerSx}>
            <Loader />
          </Center>
        )}
        {notFound && <NotFound />}
        {userHasNoPinnedRepos && (
          <Center w="100%" h="100%">
            <Stack>
              <Image src={githubData?.avatar_url} sx={userImageSx} alt="User Github avatar" />
              <Text sx={emptyTextSx}>{`${user}'s bulletin is empty!`}</Text>
              {isMyPage && (
                <Button
                  sx={editBtnSx}
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
        {userIsEditing && (
          <Container>
            <Flex sx={editBarSx} ref={containerRef}>
              <Flex>
                <Button
                  onClick={() =>
                    setBulletinClientData((prev) => {
                      if (prev === undefined) return prev;
                      prev.sections.push(newSection());
                    })
                  }
                  disabled={atLeastOneSectionHasNoNameOrRepos || isSaving}
                  sx={addSectionBtnSx}
                >
                  <Flex mr="3px" align="center">
                    <IconPlus />
                  </Flex>
                  {isScreenXl && "Add Section"}
                </Button>
              </Flex>
              {hasWarning && (
                <Text span sx={warningTextSx}>
                  {warningText}
                </Text>
              )}
              <Group sx={btnGroupSx}>
                <Button
                  variant="gradient"
                  disabled={saveIsDisabled}
                  sx={saveBtnSx}
                  onClick={() => saveBulletin(bulletinClientData as Exclude<Bulletin, null>)}
                >
                  {isScreenLg && "Save All"}
                  {isScreenMd && <IconDeviceFloppy size={20} />}
                  {isScreenSm && <IconDeviceFloppy size={14} />}
                </Button>
                <Button
                  disabled={isSaving}
                  sx={cancelBtnSx}
                  onClick={() => {
                    setBulletinClientData(bulletinServerData!);
                    router.push(`/${user}`);
                  }}
                >
                  {isScreenLg && "Cancel"}
                  {isScreenMd && <IconSquareLetterX size={20} />}
                  {isScreenSm && <IconSquareLetterX size={14} />}
                </Button>
              </Group>
            </Flex>
            <Box pt={30}></Box>
            <DndContext id="dnd" onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
              <SortableContext
                items={bulletinClientData?.sections.map((section) => section.id) ?? ["ZZZZZ"]}
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
                {isDraggingSection && (
                  <SortableSection
                    animateReposRef={reposAnimateRef}
                    section={(() => {
                      const draggedSectionIndex = bulletinClientData!.sections.findIndex(
                        (section) => section.id === dragActiveItem.id,
                      );
                      const draggedSection = bulletinClientData!.sections[draggedSectionIndex];
                      return draggedSection;
                    })()}
                    contributions={contributions}
                    onChange={setBulletinClientData}
                    user={user}
                  />
                )}
                {isDraggingRepo && (
                  <SortableRepo
                    contribution={dragActiveItem as PublicContribution}
                    onRemove={() => {}}
                    mediaQueryWidth={(() => {
                      const xPadding = 40;
                      return `${(containerRef.current!.offsetWidth - xPadding) * 0.49}px`;
                    })()}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </Container>
        )}
        {isEditable && (
          <Container>
            <Center mt={40}>
              <Image src={githubData?.avatar_url} height={100} width={100} radius={9999} />
              <Text sx={pageEditTextSx}>
                {githubData?.login}

                {isMyPage && (
                  <Button
                    variant="gradient"
                    leftIcon={<IconPencil />}
                    size="lg"
                    component={Link}
                    href={`/${user}?edit=true`}
                    compact
                    sx={pageEditBtnSx}
                  >
                    Edit
                  </Button>
                )}
              </Text>
            </Center>
            {bulletinClientData?.sections.map((section) => {
              const queryClient = useQueryClient();
              const publicContributionsCachedData = queryClient.getQueryData([
                "contributions",
                user?.toLowerCase(),
              ]) as PublicContribution[];

              return (
                <Fragment key={section.id}>
                  <Text sx={sectionNameSx}>{section.name}</Text>
                  <Flex sx={sectionContainerSx}>
                    {section.repos.map((repo) => {
                      const contributionIndex = publicContributionsCachedData.findIndex(
                        (contribution) => contribution.id === repo.repoID,
                      );
                      const contribution = publicContributionsCachedData[contributionIndex];

                      return (
                        <Paper sx={repoCardSx} key={repo.id}>
                          <Flex direction={"column"}>
                            <Flex align={"center"}>
                              <Text component="a" target="_blank" href={contribution.html_url} sx={repoNameSx}>
                                {contribution.name}
                              </Text>
                            </Flex>
                            <Text sx={repoDescriptionSx}>{contribution.description}</Text>
                          </Flex>

                          <Flex>
                            {contribution.language !== null && (
                              <Text sx={repoLanguageSx}>
                                <Box sx={repoLanguageColorSx(contribution.language as keyof typeof languageColors)} />
                                {contribution.language}
                              </Text>
                            )}
                            {contribution.stargazers_count > 0 && (
                              <Text sx={repoStarsTextSx}>
                                <IconStar size={16} />
                                {contribution.stargazers_count}
                              </Text>
                            )}
                            {contribution.forks_count > 0 && (
                              <Text sx={repoDetailsTextSx}>
                                <RepoForkedIcon size={15} fill="#7d8590" />
                                {contribution.forks_count}
                              </Text>
                            )}
                          </Flex>
                        </Paper>
                      );
                    })}
                  </Flex>
                </Fragment>
              );
            })}
          </Container>
        )}
      </Box>
    </>
  );
};

export default User;
