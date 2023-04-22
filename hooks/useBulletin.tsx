import { useQuery } from "react-query";
import { apiClient } from "../client/apiClient";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";

type Param = {
  user: string | undefined;
  setNotFound: Dispatch<SetStateAction<boolean | undefined>>;
};

export const useBulletin = ({ user, setNotFound }: Param) => {
  return useQuery(["bulletin", user], fetchBulletin(user), {
    onSuccess: (data) => {
      console.log(data);
      setNotFound(false);
    },
    onError: (err: AxiosError) => {
      if (err.response?.status === 404) {
        setNotFound(true);
        return;
      }
    },
    enabled: user !== undefined,
  });
};

type Bulletin = {
  sections: { id: string; name: string; repos: number[] }[];
} | null;

const fetchBulletin = (user: string | undefined) => async () => {
  if (user === undefined) {
    // NOTE: should not reach here. Query is disabled when user === undefined
    return;
  }
  const ret = await apiClient.get<Bulletin>(`/bulletin?user=${user}`);
  return ret.data;
};
