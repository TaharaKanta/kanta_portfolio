import en from "@/constants/en";
import ja from "@/constants/ja";
import { useRouter } from "next/router";

export default function useLocale() {
  const { locale } = useRouter();
  const lan = locale === "en" ? en : ja;
  return { locale, lan}
}