import React, { createContext, useContext, useState} from "react";

type HideTabBarContextType = {
  isTabBarHidden: boolean;
  setIsTabBarHidden: (v: boolean) => void;
};

const HideTabBarContext = createContext<HideTabBarContextType | undefined>(
  undefined,
);

export function HideTabBarProvider({children}: {children: React.ReactNode}) {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);

  return (
    <HideTabBarContext.Provider
      value={{isTabBarHidden, setIsTabBarHidden}}
    >
      {children}
    </HideTabBarContext.Provider>
  );
}

export function useHideTabBar() {
  const context = useContext(HideTabBarContext)
  if (!context) throw new Error("useHideTabBar must be used within a HideTabBarProvider")
  return context
}