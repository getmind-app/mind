export const isMoreThan24HoursLater = (dateToCheck: string | Date): boolean => {
    const currentDate = new Date();
    const targetDate = new Date(dateToCheck);

    // Calculate the difference in hours between the two dates
    const timeDifferenceInHours =
        (targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);

    return timeDifferenceInHours > 24;
};
