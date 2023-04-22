import { Box, Flex, Loader, Text } from "@mantine/core";
import Link from "next/link";
import { NAVBAR_HEIGHT } from "./styles";
import { useAuth } from "../contexts/AuthProvider";
import { useLogoutMutation } from "../hooks/useLogoutMutation";
import { useRouter } from "next/router";

export const Navbar = () => {
  const { account, isLoading } = useAuth();
  const { mutate: logout } = useLogoutMutation();
  const router = useRouter();

  return (
    <Flex
      pos="absolute"
      sx={{
        zIndex: 9999,
        height: NAVBAR_HEIGHT,
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Text ml="xl" size="1.4rem" color="white" component={Link} href="/">
        Repobullet.in
      </Text>
      <Box>
        {!isLoading && account && (
          <Text
            mr="xl"
            size="1rem"
            color="white"
            component={Link}
            href="/settings"
            sx={{ background: "none", border: "none" }}
          >
            Settings
          </Text>
        )}
        {isLoading && <Loader mr="40px" size="sm" />}
        {!isLoading && account && (
          <Text
            mr="xl"
            size="1rem"
            color="white"
            component="button"
            sx={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={() => logout()}
          >
            Logout
          </Text>
        )}
        {!isLoading && !account && router.pathname !== "/" && (
          <Text
            mr="xl"
            size="1rem"
            color="white"
            component="a"
            href="/.netlify/functions/redirect"
          >
            Login with GitHub
          </Text>
        )}
      </Box>
    </Flex>
  );
};
