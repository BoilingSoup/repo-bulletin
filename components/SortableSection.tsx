import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Modal,
  Paper,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { Bulletin, Section } from "../hooks/useBulletin";
import { IconPlus, IconStar } from "@tabler/icons-react";
import {
  PublicContribution,
  usePublicContributions,
} from "../hooks/usePublicContributions";
import { useDisclosure } from "@mantine/hooks";
import { Fragment, useState } from "react";
import { Updater } from "use-immer";
import { useQueryClient } from "react-query";
import { languageColors } from "./helpers";
import { ForkIcon } from "./ForkIcon";
import { RepoForkedIcon } from "@primer/octicons-react";

type Props = {
  section: Section;
  contributions: PublicContribution[] | undefined;
  onChange: Updater<Exclude<Bulletin, null> | undefined>;
  user: string | undefined;
};

export const SortableSection = ({
  section,
  contributions,
  onChange: setBulletinClientData,
  user,
}: Props) => {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [checkedRepos, setCheckedRepos] = useState(section.repos);

  const handleListItemOnClick = (contributionID: number) => () => {
    setCheckedRepos((prev) => {
      if (prev.includes(contributionID)) {
        return prev.filter((repoID) => repoID !== contributionID);
      }
      return [...prev, contributionID];
    });
  };

  const addButtonText =
    checkedRepos.length !== 1
      ? `Add ${checkedRepos.length} repos`
      : `Add 1 repo`;

  const queryClient = useQueryClient();
  const publicContributionsCachedData = queryClient.getQueryData([
    "contributions",
    user?.toLowerCase(),
  ]) as PublicContribution[];

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Your public repos"
        centered
        styles={{
          close: {
            background: theme.colors.github[7],
            color: "white",
            ":hover": { background: theme.colors.github[6] },
          },
          header: { background: theme.colors.github[7], color: "white" },
          content: { background: theme.colors.github[7] },
          body: {
            paddingLeft: 0,
            paddingBottom: 0,
            paddingRight: 0,
          },
        }}
      >
        <Box h="400px" sx={{ overflow: "auto" }}>
          <Flex direction="column">
            {contributions?.map((contribution) => (
              <Fragment key={contribution.id}>
                {/* <ContributionListItem contribution={contribution} /> */}

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
                    checked={checkedRepos.includes(contribution.id)}
                    readOnly
                  />
                  <Text color="dark.1">{contribution.name}</Text>
                </Flex>
              </Fragment>
            ))}
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
                  (prevStateSection) => prevStateSection.id === section.id
                );
                if (currSectionIndex === -1) {
                  return prev;
                }
                const currSection = prev.sections[currSectionIndex];
                currSection.repos = checkedRepos;
              });
            }}
          >
            {addButtonText}
          </Button>
        </Flex>
      </Modal>
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
              onClick={open}
            >
              Add Repos
            </Button>
          </Center>
        )}

        {section.repos.length > 0 && (
          <Flex wrap={"wrap"} justify={"space-between"}>
            {section.repos.map((repoID) => {
              const contributionIndex = publicContributionsCachedData.findIndex(
                (contribution) => contribution.id === repoID
              );
              const contribution =
                publicContributionsCachedData[contributionIndex];
              return (
                <Paper
                  key={repoID}
                  sx={(theme) => ({
                    width: "100%",
                    background: theme.colors.github[9],
                    "@media (min-width: 45em)": {
                      width: "49%",
                    },
                    border: "#30363d 1px solid",
                    borderRadius: "6px",
                    padding: theme.spacing.md,
                    marginTop: theme.spacing.md,
                  })}
                >
                  <Text color="#2F81F7" size="16px">
                    {contribution.name}
                  </Text>
                  <Text
                    color="#7d8590"
                    size="14px"
                    sx={{ marginBottom: "16px" }}
                  >
                    {contribution.description}
                  </Text>
                  <Flex>
                    {contribution.language !== null && (
                      <Text color="#7d8590" size="12px">
                        <Box
                          w={12}
                          h={12}
                          sx={{
                            background:
                              languageColors[
                                contribution.language as keyof typeof languageColors
                              ].color ?? "initial",
                            borderRadius: 9999,
                            display: "inline-block",
                          }}
                        />
                        {contribution.language}
                      </Text>
                    )}
                    {contribution.stargazers_count > 0 && (
                      <Text color="#7d8590">
                        <IconStar size={16} />
                        {contribution.stargazers_count}
                      </Text>
                    )}
                    <RepoForkedIcon size={16} fill="#7d8590" />
                    {contribution.forks_count > 0 && (
                      <Text color="#7d8590">
                        <ForkIcon />
                        {contribution.stargazers_count}
                      </Text>
                    )}
                  </Flex>
                </Paper>
              );
            })}
          </Flex>
        )}
      </Paper>
    </>
  );
};
