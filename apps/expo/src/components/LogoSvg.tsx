import { Image, View } from "react-native";

import logo from "../../assets/mind.png";

interface Props {
  className?: string;
}

export function LogoSvg({ className }: Props) {
  return (
    <Image
      source={logo}
      alt="mind logo"
      className={className ?? "object-contain"}
    />
  );
}
