import { api } from "../../utils/api";

export function useRecurrenceCanHappen({
    therapistId,
    scheduledTo,
}: {
    therapistId: string;
    scheduledTo: Date | null;
}) {
    return api.recurrences.checkRecurrenceCanHappen.useQuery(
        {
            therapistId,
            scheduledTo: scheduledTo as Date,
        },
        {
            enabled: !!scheduledTo,
        },
    );
}
