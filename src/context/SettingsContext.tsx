import { createContext, useContext, useState } from "react";

interface SettingsContextType {
  yellowLimit: number;
  redLimit: number;
  setYellowLimit: (value: number) => void;
  setRedLimit: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [yellowLimit, setYellowLimit] = useState(10); // minutos
  const [redLimit, setRedLimit] = useState(15);       // minutos

  return (
    <SettingsContext.Provider value={{ yellowLimit, redLimit, setYellowLimit, setRedLimit }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
