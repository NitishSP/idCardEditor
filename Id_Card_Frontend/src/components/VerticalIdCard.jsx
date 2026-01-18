import React from "react";
import { cardSizes } from "../utils/constants";

const VerticalIdCard = ({ children, className = "", style = {} }) => {
  return (
    <div
      className={`bg-white shadow-lg overflow-hidden ${className}`}
      style={{
        width: `${cardSizes.height}px`, // Swap width and height for vertical
        height: `${cardSizes.width}px`,
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default VerticalIdCard;
