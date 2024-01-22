import { t } from "@lingui/macro";

import { type WeekDay } from "../../../../packages/db";

export function getTranslatedDay(day: WeekDay | string): string {
    if (day === "MONDAY") {
        return t({ message: "Monday" });
    } else if (day === "TUESDAY") {
        return t({ message: "Tuesday" });
    } else if (day === "WEDNESDAY") {
        return t({ message: "Wednesday" });
    } else if (day === "THURSDAY") {
        return t({ message: "Thursday" });
    } else if (day === "FRIDAY") {
        return t({ message: "Friday" });
    } else if (day === "SATURDAY") {
        return t({ message: "Saturday" });
    } else if (day === "SUNDAY") {
        return t({ message: "Sunday" });
    } else {
        return t({ message: "Invalid Day" });
    }
}
