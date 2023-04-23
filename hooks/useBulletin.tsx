import { useQuery } from "react-query";
import { apiClient } from "../client/apiClient";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";
// import { useAuth } from "../contexts/AuthProvider";
import { newBulletin } from "../components/helpers";

type Param = {
  id: number | undefined;
  setNotFound: Dispatch<SetStateAction<boolean | undefined>>;
  setBulletin: Dispatch<SetStateAction<Exclude<Bulletin, null> | undefined>>;
  enabled: boolean;
};

export const useBulletin = ({
  id,
  setNotFound,
  setBulletin,
  enabled: githubIsFetched,
}: Param) => {
  // const { account } = useAuth();

  return useQuery(["bulletin", id], fetchBulletin(id), {
    onSuccess: (data) => {
      if (data === undefined) {
        // NOTE: should never be undefined
        return;
      }

      // const isMyAccount = user?.toLowerCase() === account?.name.toLowerCase();

      // if (!isMyAccount) {
      //   setNotFound(false);
      //   return;
      // }

      if (data === null) {
        setBulletin(newBulletin());
        setNotFound(false);
        return;
      }

      setBulletin(data);
      setNotFound(false);
    },
    onError: (err: AxiosError) => {
      if (err.response?.status === 404) {
        setNotFound(true);
        return;
      }
    },
    enabled: githubIsFetched && id !== undefined,
  });
};

export type Bulletin = {
  sections: { id: string; name: string; repos: number[] }[];
} | null;

const fetchBulletin = (id: number | undefined) => async () => {
  if(id === undefined) {
    // NOTE: should never reach here. Query is disabled until id is defined
    return
  }
  const ret = await apiClient.get<Bulletin>(`/bulletin?id=${id}`);
  return ret.data;
};
