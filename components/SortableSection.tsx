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
import { IconPlus } from "@tabler/icons-react";
import { PublicContribution } from "../hooks/usePublicContributions";
import { useDisclosure } from "@mantine/hooks";
import { Fragment, useState } from "react";
import { Updater } from "use-immer";

type Props = {
  section: Section;
  contributions: PublicContribution[] | undefined;
  onChange: Updater<Exclude<Bulletin, null> | undefined>;
};

export const SortableSection = ({
  section,
  contributions,
  onChange: setBulletinClientData,
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
        {section.repos.length > 0 &&
          section.repos.map((repo) => (
            <Paper>
              <Text>ID: {repo}</Text>
            </Paper>
          ))}
      </Paper>
    </>
  );
};
