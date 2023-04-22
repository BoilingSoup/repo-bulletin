import {
  Dispatch,
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
  children: JSX.Element;
};

export const AuthProvider = ({ children }: Props) => {
  const [account, setAccount] = useState<Account>(null);
  const { isLoading } = useQuery(["account"], fetchAccount, {
    onSuccess: (user) => {
      setAccount(user);
    },
  });

  return (
    <AuthContext.Provider value={{ account, setAccount, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const fetchAccount = async () => {
  const ret = await apiClient.get<Account>("/account");
  return ret.data;
};
