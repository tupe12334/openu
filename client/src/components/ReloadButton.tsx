import React from "react";

const ReloadButton: React.FC<{
  onClick: (event: React.MouseEvent) => void;
}> = ({ onClick }) => {
  return (
    <span className="reload-icon" onClick={onClick}>
      🔄
    </span>
  );
};

export default ReloadButton;
