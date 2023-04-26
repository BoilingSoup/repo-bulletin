import { useMutation, useQueryClient } from "react-query";
import { apiClient } from "../client/apiClient";
import { Bulletin } from "./useBulletin";
import { Updater } from "use-immer";
import { useRouter } from "next/router";

type Param = {
  id: number | undefined;
  setBulletinClientData: Updater<Exclude<Bulletin, null> | undefined>;
};

export const useSaveMutation = ({ id, setBulletinClientData }: Param) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    (bulletinState: Exclude<Bulletin, null>) => saveBulletin(bulletinState),
    {
      onSuccess: (_, bulletinState) => {
        setBulletinClientData(bulletinState);
        queryClient.setQueryData(["bulletin", id], bulletinState);
        router.push(router.asPath.split("?")[0]);
      },
    }
  );
};

const saveBulletin = async (bulletinState: Exclude<Bulletin, null>) => {
  const url =
    "http://localhost:8888/.netlify/functions/save?x=" +
    JSON.stringify(bulletinState);
  // yes, I'm using a GET request to save.
  // I've never used aws lambda nor Netlify serverless go funcs before, and I can't get the dev server to properly receive request bodies.
  const ret = await apiClient.get(url);
  return ret.data;
};
