import { type inferAsyncReturnType } from "@trpc/server";
import Stripe from "stripe";

import { type Appointment } from "@acme/db";

import { getTherapistAndPatient } from "../appointments/getTherapistAndPatient";
import { type createContext } from "../trpc";

export async function payForAppointment({
    appointment,
    prisma,
}: {
    appointment: Appointment;
    prisma: inferAsyncReturnType<typeof createContext>["prisma"];
}) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2023-08-16",
    });

    const [therapist, patient] = await getTherapistAndPatient({
        prisma,
        appointment,
    });

    if (!therapist.paymentAccountId) {
        throw new Error("Missing payment account id for therapist");
    }

    if (!patient.paymentAccountId) {
        throw new Error("Missing payment account id for patient");
    }

    if (!therapist.hourlyRate) {
        throw new Error("Missing payment account id for patient");
    }

    if (!process.env.FIXED_APPLICATION_FEE) {
        throw new Error("Missing application fee");
    }

    const paymentMethod = await stripe.customers.listPaymentMethods(
        patient.paymentAccountId,
        {
            limit: 1,
        },
    );

    if (!paymentMethod.data || !paymentMethod.data[0]) {
        throw new Error("Missing payment method");
    }

    const paymentResponse = await stripe.paymentIntents.create({
        customer: patient.paymentAccountId,
        confirm: true,
        description: "Appointment payment",
        currency: "brl",
        amount: therapist.hourlyRate * 100,
        payment_method: paymentMethod.data[0].id,
        transfer_data: {
            destination: therapist.paymentAccountId,
        },
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
        },
        application_fee_amount:
            parseFloat(process.env.FIXED_APPLICATION_FEE) *
            100 *
            therapist.hourlyRate,
    });

    if (paymentResponse.status !== "succeeded") {
        throw new Error("Payment failed");
    }

    await prisma.appointment.update({
        where: {
            id: appointment.id,
        },
        data: {
            isPaid: true,
        },
    });
}
