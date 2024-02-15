import { Button, Center, Group, Loader, Stack, Text } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthProvider";
import { useDeleteAccountMutation } from "../hooks/useDeleteAccountMutation";
import { deleteAccountTextSx, deleteDenyBtnSx, settingsBtnSx, settingsLoadingContainerSx } from "../components/styles";
import { useRedirect } from "../hooks/useRedirect";

const Settings: NextPage = () => {
  const router = useRouter();
  const { account, isLoading, isFetched } = useAuth();
  const { mutate: deleteAccount, isLoading: isDeleting } = useDeleteAccountMutation();

  const isUnauthenticated = isFetched && !account;

  useRedirect({
    to: "/",
    if: isUnauthenticated,
  });

  return (
    <Center bg="github.9" h="100vh" w="100vw">
      {(isLoading || isDeleting) && (
        <Center sx={settingsLoadingContainerSx}>
          <Loader />
        </Center>
      )}
      {!isLoading && (
        <Stack>
          <Text sx={deleteAccountTextSx}>Delete your account?</Text>
          <Group>
            <Button sx={settingsBtnSx} onClick={() => deleteAccount()}>
              Yes
            </Button>
            <Button sx={deleteDenyBtnSx} onClick={() => router.push("/")}>
              No
            </Button>
          </Group>
        </Stack>
      )}
    </Center>
  );
};

export default Settings;
