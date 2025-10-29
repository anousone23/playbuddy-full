import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";

export default function AppName({ textStyles }: { textStyles?: string }) {
  return (
    <MaskedView
      maskElement={
        <Text
          className={`font-poppins-bold text-4xl bg-transparent text-center ${textStyles}`}
        >
          PLAY BUDDY
        </Text>
      }
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={["#0891b2", "#22d3ee", "#0891b2"]}
      >
        <Text
          className={`font-poppins-bold text-4xl bg-transparent opacity-0 text-center ${textStyles}`}
        >
          PLAY BUDDY
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
