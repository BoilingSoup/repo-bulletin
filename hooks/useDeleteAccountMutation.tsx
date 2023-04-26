import { useMutation } from "react-query";
import { apiClient } from "../client/apiClient";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthProvider";

export const useDeleteAccountMutation = () => {
  const router = useRouter()
  const { setAccount } = useAuth();
  
  return useMutation(deleteAccount, {
    onSuccess: () => {
      setAccount(null)
      router.push("/")
    }
  });
};

const deleteAccount = async () => {
  const ret = await apiClient.delete("/delete-account");
  return ret.data;
};
