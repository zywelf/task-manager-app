import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import it from "./it";
import en from "./en";

const i18n = new I18n({ it, en });

const deviceLocale = getLocales()[0].languageCode ?? "en";
i18n.locale = deviceLocale === "it" ? "it" : "en";
i18n.enableFallback = true;
i18n.defaultLocale = "en";

export default i18n;