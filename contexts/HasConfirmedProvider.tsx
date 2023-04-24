import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type ConfirmedDeleteStatus = {
  hasConfirmedDelete: boolean;
  setHasConfirmedDelete: Dispatch<SetStateAction<boolean>>;
};

const ConfirmedDeleteStatusContext = createContext<
  ConfirmedDeleteStatus | undefined
>(undefined);

export const useConfirmedDeleteStatus = () => {
  const context = useContext(ConfirmedDeleteStatusContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

type Props = {
  children: ReactNode;
};

export const ConfirmedDeleteStatusProvider = ({ children }: Props) => {
  const [hasConfirmedDelete, setHasConfirmedDelete] = useState<boolean>(false);

  return (
    <ConfirmedDeleteStatusContext.Provider
      value={{ hasConfirmedDelete, setHasConfirmedDelete }}
    >
      {children}
    </ConfirmedDeleteStatusContext.Provider>
  );
};
