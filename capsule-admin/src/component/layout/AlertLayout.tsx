import { ReactNode } from "react";

interface AlertLayoutProps {
  children: ReactNode;
}

const AlertLayout: React.FC<AlertLayoutProps> = ({ children }) => {
  return (
    <>
      <div className="dim-background"></div>
      <div className="layer-alert">
        {children}
      </div>
    </>
  );
}

export default AlertLayout;