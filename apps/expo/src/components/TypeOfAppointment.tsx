import { t } from "@lingui/macro";

import { type AppointmentType } from "../../../../packages/db";
import { BasicText } from "./BasicText";

export function TypeOfAppointment({
    appointmentType,
}: {
    appointmentType: AppointmentType;
}) {
    const appointmentMapper: {
        [key in AppointmentType]: string;
    } = {
        FIRST_IN_RECURRENCE: t({ message: "First in recurrence" }),
        SINGLE: t({ message: "Single" }),
        RECURRENT: t({ message: "Recurrent" }),
        SINGLE_REPEATED: t({ message: "Repeated" }),
    };

    return (
        <BasicText color="black">
            {appointmentMapper[appointmentType]}
        </BasicText>
    );
}
