import React from "react";

type LogoProps = {
  className?: string;
  title?: string;
};

export function Logo({ className = "w-8 h-8", title = "FormFlow" }: LogoProps) {
  return (
    <img
      src="/formFlow_logo.png"
      alt={title}
      className={className}
      width={32}
      height={32}
      style={{ objectFit: "contain" }}
    />
  );
}

export default Logo;
