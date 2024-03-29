import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { useQuery } from "react-query";
import { apiClient } from "../client/apiClient";

type Account = {
  id: number;
  name: string;
} | null;

type UserContext = {
  account: Account;
  setAccount: Dispatch<SetStateAction<Account>>;
  isLoading: boolean;
  isFetched: boolean;
};

const AuthContext = createContext<UserContext | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [account, setAccount] = useState<Account>(null);
  const { isLoading, isFetched } = useQuery(["account"], fetchAccount, {
    onSuccess: (user) => {
      setAccount(user);
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });

  return (
    <AuthContext.Provider value={{ account, setAccount, isLoading, isFetched }}>
      {children}
    </AuthContext.Provider>
  );
};

const fetchAccount = async () => {
  const ret = await apiClient.get<Account>("/account");
  return ret.data;
};
