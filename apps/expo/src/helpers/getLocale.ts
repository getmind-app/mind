import { type I18nContext } from "@lingui/react";
import { enUS, ptBR } from "date-fns/locale";

export function getLocale(lingui: I18nContext) {
    if (lingui.i18n.locale === "pt") return ptBR;
    return enUS;
}
