import { AxiosError } from "axios";
import { useQuery } from "react-query";
import { githubClient } from "../client/apiClient";
import { Dispatch, SetStateAction } from "react";

type Param = {
  user: string | undefined;
  setNotFound: Dispatch<SetStateAction<boolean | undefined>>;
  enabled: boolean;
};

export const useGithub = ({
  user,
  setNotFound,
  enabled: routeUserParamIsDefined,
}: Param) => {
  return useQuery(["github", user?.toLowerCase()], fetchGithub(user), {
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (err: AxiosError) => {
      if (err.response?.status === 404) {
        setNotFound(true);
        return;
      }
      console.log(err);
    },
    enabled: routeUserParamIsDefined,
  });
};

type GithubResponse = {
  login: string;
  id: number;
  avatar_url: string;
};

const fetchGithub = (user: string | undefined) => async () => {
  if (user === undefined) {
    // NOTE: should not reach here. Query is disabled when user === undefined
    return;
  }
  const ret = await githubClient.get<GithubResponse>("/users/" + user);
  return ret.data;
};
