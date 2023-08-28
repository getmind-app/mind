// TODO: probably there's a better way to do this
export default function getDaysInCurrentMonth() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Adding 1 because months are zero-based

    // Set the date to the next month and day 0 (last day of the current month)
    date.setFullYear(year, month, 0);

    const daysInMonth = date.getDate();
    const daysArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
        daysArray.push(day);
    }

    return daysArray.filter((day) => day >= new Date().getDate());
}
