import React from "react";
import { cardSizes } from "../utils/constants";

const HoritintalIdCard = ({ children, className = "", style = {} }) => {
  return (
    <div
      className={`bg-white shadow-lg overflow-hidden ${className}`}
      style={{
        width: `${cardSizes.width}px`, // Standard CR80 card size
        height: `${cardSizes.height}px`,
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default HoritintalIdCard;
