import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { groupBy } from "lodash-es";

interface MonthData {
    monthName: string;
    dates: Date[];
}

export default function getNext30Days(): [MonthData, MonthData] {
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(currentDate);
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

    const dateObjects: Date[] = [];
    const currentDateCopy = new Date(currentDate);

    while (currentDateCopy <= thirtyDaysFromNow) {
        dateObjects.push(new Date(currentDateCopy));
        currentDateCopy.setDate(currentDateCopy.getDate() + 1);
    }

    const groupedByMonth = groupBy(dateObjects, (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return `${year}-${month}`;
    });

    const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const nextMonthKey = `${thirtyDaysFromNow.getFullYear()}-${thirtyDaysFromNow.getMonth()}`;

    const monthData: [MonthData, MonthData] = [
        {
            monthName: format(currentDate, "MMMM yyyy", { locale: enUS }),
            dates: groupedByMonth[currentMonthKey] || [],
        },
        {
            monthName: format(thirtyDaysFromNow, "MMMM yyyy", { locale: enUS }),
            dates: groupedByMonth[nextMonthKey] || [],
        },
    ];

    return monthData;
}
