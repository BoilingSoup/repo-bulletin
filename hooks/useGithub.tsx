import { AxiosError } from "axios";
import { useQuery } from "react-query";
import { githubClient } from "../client/apiClient";

type Param = {
  user: string | undefined;
  enabled: boolean | undefined;
};

export const useGithub = ({ user, enabled }: Param) => {
  return useQuery(["github", user], fetchGithub({ user, enabled }), {
    onSuccess: (data) => {
      console.log(data);
      // setNotFound(false);
    },
    onError: (err: AxiosError) => {
      // if (err.response?.status === 404) {
      // setNotFound(true);
      //   return;
      // }
      console.log(err);
    },
    enabled: enabled !== undefined,
  });
};

type GithubResponse = {
  avatar_url: string;
};

const fetchGithub =
  ({ user, enabled }: Param) =>
  async () => {
    if (user === undefined || enabled === undefined) {
      // NOTE: should not reach here. Query is disabled when user === undefined
      return;
    }
    const ret = await githubClient.get<GithubResponse>(user);
    return ret.data;
  };
