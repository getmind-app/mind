export function getMonthInLocale({
    locale,
    monthIndex,
}: {
    locale: string;
    monthIndex: number;
}) {
    const date = new Date();
    date.setMonth(monthIndex);

    return date.toLocaleString(locale, {
        month: "long",
    });
}
