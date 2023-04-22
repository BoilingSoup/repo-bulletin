import { Box, Center, Stack, Text } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useBulletin } from "../hooks/useBulletin";
import { useState } from "react";
import { IconMoodSmileDizzy } from "@tabler/icons-react";
// import { useEffect } from "react";

const User: NextPage = () => {
  const router = useRouter();
  const { user } = router.query;
  const [notFound, setNotFound] = useState<boolean>(false);

  useBulletin({ user: user as string, setNotFound });

  return (
    <>
      <Box
        sx={(theme) => ({
          width: "100vw",
          height: "100vh",
          background: theme.colors.github[9],
        })}
      >
        {/* <Text color="dark.3">{JSON.stringify(router.query.user)}</Text> */}
        {notFound && (
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
        )}
      </Box>
    </>
  );
};

export default User;
