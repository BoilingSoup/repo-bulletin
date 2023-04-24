import { Box, Button, Flex, Paper, Text } from "@mantine/core";
import { GrabberIcon, RepoForkedIcon } from "@primer/octicons-react";
import { IconStar, IconX } from "@tabler/icons-react";
import { PublicContribution } from "../hooks/usePublicContributions";
import { languageColors } from "./helpers";

type Props = {
  contribution: PublicContribution;
  onRemove: (id: number) => void;
};

export const SortableRepo = ({
  contribution,
  onRemove: handleRepoRemove,
}: Props) => {
  return (
    <Paper
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      })}
    >
      <Flex direction={"column"}>
        <Flex align={"center"}>
          <Text color="#2F81F7" size="16px" weight={"bold"}>
            {contribution.name}
          </Text>
          <Box ml="auto" sx={{ cursor: "grab" }}>
            <GrabberIcon size={16} fill="#7d8590" />
          </Box>
        </Flex>
        <Text color="#7d8590" size="14px" sx={{ marginBottom: "16px" }}>
          {contribution.description}
        </Text>
      </Flex>

      <Flex>
        {contribution.language !== null && (
          <Text
            color="#7d8590"
            size="12px"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
            mr="16px"
          >
            <Box
              w={12}
              h={12}
              sx={{
                background:
                  languageColors[
                    contribution.language as keyof typeof languageColors
                  ].color ?? "initial",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 9999,
                display: "inline-block",
              }}
              mr="4px"
            />
            {contribution.language}
          </Text>
        )}
        {contribution.stargazers_count > 0 && (
          <Text
            color="#7d8590"
            size="12px"
            mr="16px"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <IconStar size={16} />
            {contribution.stargazers_count}
          </Text>
        )}
        {contribution.forks_count > 0 && (
          <Text
            color="#7d8590"
            size="12px"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <RepoForkedIcon size={15} fill="#7d8590" />
            {contribution.stargazers_count}
          </Text>
        )}
        <Button
          variant="subtle"
          sx={(theme) => ({
            color: "#7d8590",
            ":hover": { background: theme.colors.github[9] },
          })}
          size="xs"
          ml="auto"
          onClick={() => handleRepoRemove(contribution.id)}
        >
          <IconX />
          Remove
        </Button>
      </Flex>
    </Paper>
  );
};
