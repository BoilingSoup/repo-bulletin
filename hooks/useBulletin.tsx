import { useQuery } from "react-query";
import { apiClient } from "../client/apiClient";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";
// import { useAuth } from "../contexts/AuthProvider";
import { newBulletin } from "../components/helpers";
import { Updater } from "use-immer";

type Param = {
  id: number | undefined;
  setNotFound: Dispatch<SetStateAction<boolean | undefined>>;
  setBulletinClientData: Updater<Exclude<Bulletin, null> | undefined>;
  enabled: boolean;
};

export const useBulletin = ({
  id,
  setNotFound,
  setBulletinClientData,
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
        setBulletinClientData(newBulletin());
        setNotFound(false);
        return;
      }

      setBulletinClientData(data);
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

export type Section = {
  id: string;
  name: string;
  repos: number[];
};

export type Bulletin = {
  sections: Section[];
} | null;

const fetchBulletin = (id: number | undefined) => async () => {
  if (id === undefined) {
    // NOTE: should never reach here. Query is disabled until id is defined
    return;
  }
  const ret = await apiClient.get<Bulletin>(`/bulletin?id=${id}`);
  return ret.data;
};
