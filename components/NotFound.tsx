import { Center, Stack, Text } from "@mantine/core";
import { IconMoodSmileDizzy } from "@tabler/icons-react";

export const NotFound = () => {
  return (
    <Center w="100%" h="100%">
      <Stack>
        <Text color="dark.0" size="8rem">
          404
          <IconMoodSmileDizzy size={100} />
        </Text>
        <Text color="dark.1" size="4rem" align="center">
          This user doesn't exist.
        </Text>
      </Stack>
    </Center>
  );
};
