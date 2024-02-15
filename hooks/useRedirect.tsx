import { useRouter } from "next/router";
import { useEffect } from "react";

type Param = {
  to: string;
  if: boolean;
};

export const useRedirect = (param: Param) => {
  const router = useRouter();

  useEffect(() => {
    if (param.if) {
      router.push(param.to);
    }
  }, [router, param.if]);
};
