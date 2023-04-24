import {
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
import { IconPlus } from "@tabler/icons-react";
import { PublicContribution } from "../hooks/usePublicContributions";
import { useDisclosure } from "@mantine/hooks";
import { ChangeEventHandler, Fragment, useState } from "react";
import { Updater } from "use-immer";
import { useQueryClient } from "react-query";
import { SortableRepo } from "./SortableRepo";

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

  const handleChangeSectionName: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
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
      currSection.name = event.target.value;
    });
  };

  const handleCloseModalDontApplyChanges = () => {
    setCheckedRepos(section.repos);
    close();
  };

  const handleRemoveRepo = (contributionID: number) => {
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
      const repoIDIndex = currSection.repos.findIndex(
        (repoID) => repoID === contributionID
      );
      currSection.repos.splice(repoIDIndex, 1);
    });

    setCheckedRepos((prev) =>
      prev.filter((repoID) => repoID !== contributionID)
    );
  };

  const queryClient = useQueryClient();
  const publicContributionsCachedData = queryClient.getQueryData([
    "contributions",
    user?.toLowerCase(),
  ]) as PublicContribution[];

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

              close();
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
          borderRadius: theme.radius.lg,
        })}
        mb="30px"
      >
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

        {/* {section.repos.length > 0 && ( */}
        <Flex wrap={"wrap"} justify={"space-between"}>
          {section.repos.map((repoID) => {
            const contributionIndex = publicContributionsCachedData.findIndex(
              (contribution) => contribution.id === repoID
            );
            const contribution =
              publicContributionsCachedData[contributionIndex];
            return (
              <SortableRepo
                key={repoID}
                contribution={contribution}
                onRemove={handleRemoveRepo}
              />
            );
          })}
        </Flex>
        {/* )} */}
      </Paper>
    </>
  );
};
