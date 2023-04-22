import { useQuery } from "react-query";
import { apiClient } from "../client/apiClient";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";

type Param = {
  user: string;
  setNotFound: Dispatch<SetStateAction<boolean>>;
};

export const useBulletin = ({ user, setNotFound }: Param) => {
  return useQuery(["bulletin", user], fetchBulletin(user), {
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (err: AxiosError) => {
      if (err.response?.status === 404) {
        setNotFound(true);
        return;
      }
    },
  });
};

type Bulletin = {
  sections: { id: string; name: string; repos: number[] }[];
};

const fetchBulletin = (user: string) => async () => {
  const ret = await apiClient.get<Bulletin>(`/bulletin?user=${user}`);
  return ret.data;
};
