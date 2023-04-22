import { useMutation } from "react-query";
import { apiClient } from "../client/apiClient";
import { useAuth } from "../contexts/AuthProvider";

export const useLogoutMutation = () => {
  const { setAccount } = useAuth();

  return useMutation(logout, {
    onSuccess: () => {
      console.log("logged out");
      setAccount(null);
    },
    onError: (err) => {
      // TODO: handle error
      console.log(err);
    },
  });
};

const logout = async () => {
  const ret = await apiClient.post<void>("/logout");
  return ret.data;
};
