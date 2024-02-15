import { Box, Button, Flex, Paper, Text } from "@mantine/core";
import { GrabberIcon, RepoForkedIcon } from "@primer/octicons-react";
import { IconStar, IconX } from "@tabler/icons-react";
import { PublicContribution } from "../hooks/usePublicContributions";
import { languageColors } from "./helpers";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Section } from "../hooks/useBulletin";
import {
  removeRepoBtnSx,
  repoDetailsTextSx,
  repoLanguageColorSx,
  repoStarsTextSx,
  sortableRepoContainerSx,
  sortableRepoDescriptionSx,
  sortableRepoGrabberSx,
  sortableRepoLangTextSx,
  sortableRepoNameSx,
} from "./styles";

type Props = {
  contribution: PublicContribution;
  onRemove: (id: number) => void;
  repo?: { id: string; repoID: number };
  section?: Section;
  mediaQueryWidth?: string;
};

export const SortableRepo = ({ contribution, onRemove: handleRepoRemove, repo, section, mediaQueryWidth }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: repo?.id ?? "overlay",
    data: { type: "REPO", repoID: repo?.repoID, sectionID: section?.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };

  return (
    <Paper sx={sortableRepoContainerSx(mediaQueryWidth)} ref={setNodeRef} style={style}>
      <Flex direction={"column"}>
        <Flex align={"center"}>
          <Text sx={sortableRepoNameSx} component="a" target="_blank" href={contribution.html_url}>
            {contribution.name}
          </Text>
          <Box {...attributes} {...listeners} sx={sortableRepoGrabberSx}>
            <GrabberIcon size={16} fill="#7d8590" />
          </Box>
        </Flex>
        <Text sx={sortableRepoDescriptionSx}>{contribution.description}</Text>
      </Flex>

      <Flex>
        {contribution.language !== null && (
          <Text sx={sortableRepoLangTextSx}>
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
            {contribution.stargazers_count}
          </Text>
        )}
        <Button variant="subtle" sx={removeRepoBtnSx} size="xs" onClick={() => handleRepoRemove(contribution.id)}>
          <IconX />
          Remove
        </Button>
      </Flex>
    </Paper>
  );
};
