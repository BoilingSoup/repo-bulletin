import { useQuery } from "react-query";
import { githubClient } from "../client/apiClient";

type Param = {
  user: string | undefined;
  enabled: boolean;
};

export const usePublicContributions = ({
  user,
  enabled: routeUserParamIsDefined,
}: Param) => {
  return useQuery(
    ["contributions", user?.toLowerCase()],
    fetchPublicContributions(user),
    {
      onSuccess: (data) => {
        console.log(data);
        //
      },
      onError: () => {
        //
      },
      enabled: routeUserParamIsDefined,
    }
  );
};

export type PublicContribution = {
  id: number;
  name: string;
  full_name: string;
  html_url: string; // url to the repo
  owner: {
    login: string;
    id: number;
  };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
};

const fetchPublicContributions = (user: string | undefined) => async () => {
  if (user === undefined) {
    // NOTE: should not reach here. query is disabled until user is defined
    return;
  }

  const ret = await githubClient.get<PublicContribution[]>(
    `/users/${user}/repos`
  );
  return ret.data;
};
