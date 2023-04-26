import { useMutation } from "react-query";
import { apiClient } from "../client/apiClient";
import { useAuth } from "../contexts/AuthProvider";

export const useLogoutMutation = () => {
  const { setAccount } = useAuth();

  return useMutation(logout, {
    onSuccess: () => {
      setAccount(null);
    },
    onError: (err) => {
      // TODO: handle error
    },
  });
};

const logout = async () => {
  const ret = await apiClient.post<void>("/logout");
  return ret.data;
};
