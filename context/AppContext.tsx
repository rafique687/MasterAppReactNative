import React, { createContext, useContext, useState } from "react";

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: any) => {
  const [appConfig, setAppConfig] = useState(null);

  return (
    <AppContext.Provider
      value={{
        appConfig,
        setAppConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  return useContext(AppContext);
};
