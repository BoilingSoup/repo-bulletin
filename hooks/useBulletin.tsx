import { useQuery } from "react-query";
import { apiClient } from "../client/apiClient";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { newBulletin } from "../components/helpers";

type Param = {
  user: string | undefined;
  setNotFound: Dispatch<SetStateAction<boolean | undefined>>;
  setBulletin: Dispatch<SetStateAction<Exclude<Bulletin, null> | undefined>>;
  enabled: boolean;
};

export const useBulletin = ({
  user,
  setNotFound,
  setBulletin,
  enabled: accountIsFetched,
}: Param) => {
  const { account } = useAuth();

  return useQuery(["bulletin", user], fetchBulletin(user), {
    onSuccess: (data) => {
      if (data === undefined) {
        // NOTE: should never be undefined
        return;
      }

      const isMyAccount = user?.toLowerCase() === account?.name.toLowerCase();

      if (!isMyAccount) {
        setNotFound(false);
        return;
      }

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
    enabled: user !== undefined && accountIsFetched,
  });
};

export type Bulletin = {
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
