import images from "@/constants/images";

type AppLogoProps = {
  logoStyles?: string;
  textStyles?: string;
};

export default function AppLogo({ logoStyles, textStyles }: AppLogoProps) {
  return (
    <div className="flex items-center justify-center gap-x-2">
      <img
        src={images.logo}
        alt="logo"
        className={`w-16 h-16 object-contain ${logoStyles}`}
      />

      <p
        className={`font-poppins-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600 text-2xl ${textStyles}`}
      >
        PLAYBUDDY
      </p>
    </div>
  );
}
