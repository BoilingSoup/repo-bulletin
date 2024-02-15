import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Modal,
  Paper,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { Bulletin, Section } from "../hooks/useBulletin";
import { IconPlus, IconX } from "@tabler/icons-react";
import { GrabberIcon } from "@primer/octicons-react";
import { PublicContribution } from "../hooks/usePublicContributions";
import { useDisclosure } from "@mantine/hooks";
import { ChangeEventHandler, Fragment, RefCallback, useState } from "react";
import { Updater } from "use-immer";
import { useQueryClient } from "react-query";
import { SortableRepo } from "./SortableRepo";
import { useConfirmedDeleteStatus } from "../contexts/HasConfirmedProvider";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";

type Props = {
  section: Section;
  contributions: PublicContribution[] | undefined;
  onChange: Updater<Exclude<Bulletin, null> | undefined>;
  user: string | undefined;
  animateReposRef: RefCallback<Element>;
};

// TODO: refactor
export const SortableSection = ({
  section,
  contributions,
  onChange: setBulletinClientData,
  user,
  animateReposRef,
}: Props) => {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [checkedRepos, setCheckedRepos] = useState(section.repos);

  const handleListItemOnClick = (contributionID: number) => () => {
    setCheckedRepos((prev) => {
      if (prev.map((el) => el.repoID).includes(contributionID)) {
        return prev.filter((repo) => repo.repoID !== contributionID);
      }
      return [...prev, { id: nanoid(), repoID: contributionID }];
    });
  };

  const handleChangeSectionName: ChangeEventHandler<HTMLInputElement> = (event) => {
    setBulletinClientData((prev) => {
      if (prev === undefined) {
        return prev;
      }
      const currSectionIndex = prev.sections.findIndex((prevStateSection) => prevStateSection.id === section.id);
      if (currSectionIndex === -1) {
        return prev;
      }
      const currSection = prev.sections[currSectionIndex];
      currSection.name = event.target.value;
    });
  };

  const handleCloseModalDontApplyChanges = () => {
    setCheckedRepos(section.repos);
    close();
    setSearchInput("");
  };

  const handleRemoveRepo = (contributionID: number) => {
    setBulletinClientData((prev) => {
      if (prev === undefined) {
        return prev;
      }
      const currSectionIndex = prev.sections.findIndex((prevStateSection) => prevStateSection.id === section.id);
      if (currSectionIndex === -1) {
        return prev;
      }
      const currSection = prev.sections[currSectionIndex];
      const repoIDIndex = currSection.repos.findIndex((repo) => repo.repoID === contributionID);
      currSection.repos.splice(repoIDIndex, 1);
    });

    setCheckedRepos((prev) => prev.filter((repo) => repo.repoID !== contributionID));
  };

  const { hasConfirmedDelete, setHasConfirmedDelete } = useConfirmedDeleteStatus();

  const handleRemoveSection = () => {
    if (section.repos.length > 3 && !hasConfirmedDelete) {
      setShowConfirmDeleteSection((prev) => !prev);
      return;
    }
    removeSection();
  };

  const removeSection = () => {
    setBulletinClientData((prev) => {
      if (prev === undefined) {
        return prev;
      }
      if (showConfirmDeleteSection) {
        setHasConfirmedDelete(true);
      }
      prev.sections.forEach((prevSection, index) => {
        if (prevSection.id !== section.id) {
          return;
        }
        prev.sections.splice(index, 1);
      });
    });
  };

  const queryClient = useQueryClient();
  const publicContributionsCachedData = queryClient.getQueryData([
    "contributions",
    user?.toLowerCase(),
  ]) as PublicContribution[];

  const [showConfirmDeleteSection, setShowConfirmDeleteSection] = useState(false);

  const [searchInput, setSearchInput] = useState("");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: { type: "SECTION" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleCloseModalDontApplyChanges}
        title="Your public repos"
        centered
        styles={{
          close: {
            background: theme.colors.github[7],
            color: "white",
            ":hover": { background: theme.colors.github[6] },
            zIndex: 999999999999,
          },
          header: {
            background: theme.colors.github[7],
            color: "white",
            zIndex: 999999999999,
          },
          content: { background: theme.colors.github[7], zIndex: 999999999999 },
          body: {
            paddingLeft: 0,
            paddingBottom: 0,
            paddingRight: 0,
            zIndex: 999999999999,
          },
          root: {
            zIndex: 999999999999,
          },
        }}
      >
        <TextInput
          px="md"
          my="md"
          placeholder="Search for a repo"
          value={searchInput}
          styles={{
            input: {
              background: theme.colors.github[4],
              color: theme.colors.blue[1],
              border: `1px solid ${theme.colors.github[2]}`,
            },
          }}
          onChange={(event) => {
            setSearchInput(event.target.value);
          }}
        />
        <Box
          h="400px"
          sx={{
            overflow: "auto",
            "@media (max-width: 660px)": { height: "300px" },
          }}
        >
          <Flex direction="column">
            {contributions?.map((contribution) => {
              if (contribution.name.trim().toLowerCase().includes(searchInput.trim().toLowerCase())) {
                return (
                  <Fragment key={contribution.id}>
                    <Flex
                      align={"center"}
                      sx={(theme) => ({
                        height: "50px",
                        paddingLeft: theme.spacing.md,
                        ":hover": {
                          background: theme.colors.github[5],
                          cursor: "pointer",
                        },
                      })}
                      onClick={handleListItemOnClick(contribution.id)}
                    >
                      <Checkbox
                        mr="lg"
                        checked={checkedRepos.map((el) => el.repoID).includes(contribution.id)}
                        readOnly
                      />
                      <Text color="dark.1">{contribution.name}</Text>
                    </Flex>
                  </Fragment>
                );
              }

              return;
            })}
          </Flex>
        </Box>
        <Flex justify={"end"} my="xs" mr="md">
          <Button
            disabled={checkedRepos.length < 1}
            sx={(theme) => ({
              ":disabled": { background: theme.colors.dark[4] },
            })}
            onClick={() => {
              setBulletinClientData((prev) => {
                if (prev === undefined) {
                  return prev;
                }
                const currSectionIndex = prev.sections.findIndex(
                  (prevStateSection) => prevStateSection.id === section.id,
                );
                if (currSectionIndex === -1) {
                  return prev;
                }
                const currSection = prev.sections[currSectionIndex];
                currSection.repos = checkedRepos;
              });

              close();
              setSearchInput("");
            }}
          >
            Apply
          </Button>
        </Flex>
      </Modal>
      <Paper
        key={section.id}
        sx={(theme) => ({
          background: theme.colors.github[7],
          padding: theme.spacing.lg,
          paddingTop: 0,
          borderRadius: theme.radius.lg,
          position: "relative",
        })}
        mb="30px"
        ref={setNodeRef}
        style={style}
      >
        <Center {...attributes} {...listeners} h={50} sx={{ cursor: "grab", touchAction: "none" }}>
          <GrabberIcon fill="white" size={30} /> <Text color="dark.0">Drag & Move</Text>
        </Center>
        {showConfirmDeleteSection && (
          <Center
            sx={(theme) => ({
              background: theme.colors.github[8],
              padding: theme.spacing.lg,
              borderRadius: theme.radius.lg,
              width: "100%",
              height: "100%",
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 9999999999999,
              flexDirection: "column",
            })}
          >
            <Text color="dark.1" size="2.4rem" align="center" my="xl">
              Are you sure you want to delete this section?
            </Text>
            <Flex>
              <Button w={100} mr="md" onClick={removeSection} size="xl">
                Yes
              </Button>
              <Button w={100} onClick={() => setShowConfirmDeleteSection(false)} size="xl">
                No
              </Button>
            </Flex>
          </Center>
        )}
        {!opened && (
          <Center
            pos="absolute"
            right={-15}
            top={-15}
            sx={(theme) => ({
              background: theme.colors.github[3],
              width: "30px",
              height: "30px",
              borderRadius: "999999px",
              zIndex: 1000,
            })}
          >
            <ActionIcon
              sx={(theme) => ({
                color: "white",
                borderRadius: "999999px",
                ":hover": { background: theme.colors.github[4] },
              })}
              size={30}
              onClick={handleRemoveSection}
            >
              <IconX />
            </ActionIcon>
          </Center>
        )}
        <TextInput
          value={section.name}
          onChange={handleChangeSectionName}
          styles={{
            input: {
              background: theme.colors.github[7],
              border: `1px dashed ${theme.colors.dark[2]}`,
              borderRadius: theme.radius.lg,
              color: "white",
              fontSize: "2rem",
              height: "50px",
              padding: "1rem",
              marginBottom: "1rem",
            },
          }}
        />
        {section.repos.length === 0 ? (
          <Center
            h="200px"
            w="100%"
            sx={(theme) => ({
              border: `1px dashed ${theme.colors.dark[2]}`,
              borderRadius: theme.radius.lg,
            })}
          >
            <Button
              bg="github.3"
              leftIcon={<IconPlus />}
              sx={(theme) => ({
                ":hover": {
                  background: theme.colors.github[4],
                },
              })}
              onClick={open}
            >
              Add Repos
            </Button>
          </Center>
        ) : (
          <Center>
            <Button
              bg="github.3"
              leftIcon={<IconPlus />}
              sx={{
                ":hover": {
                  background: theme.colors.github[4],
                },
              }}
              onClick={open}
            >
              Add Repos
            </Button>
          </Center>
        )}

        <SortableContext items={section.repos} strategy={rectSortingStrategy}>
          <Flex wrap={"wrap"} justify={"space-between"} ref={animateReposRef}>
            {section.repos.map((repo) => {
              const contributionIndex = publicContributionsCachedData.findIndex(
                (contribution) => contribution.id === repo.repoID,
              );
              const contribution = publicContributionsCachedData[contributionIndex];
              return (
                <SortableRepo
                  key={repo.id}
                  repo={repo}
                  section={section}
                  contribution={contribution}
                  onRemove={handleRemoveRepo}
                />
              );
            })}
          </Flex>
        </SortableContext>
      </Paper>
    </>
  );
};
