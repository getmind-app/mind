export default function getCardBrand(cardNumber: string) {
    // Define regular expressions for Visa and MasterCard patterns
    const visaPattern = /^4\d{12}(\d{3})?$/;
    const mastercardPattern = /^5[1-5]\d{14}$/;

    // Remove any non-numeric characters from the card number
    const numericCardNumber = cardNumber.replace(/\D/g, "");

    // Check if the card number matches Visa or MasterCard patterns
    if (visaPattern.test(numericCardNumber)) {
        return "visa";
    } else if (mastercardPattern.test(numericCardNumber)) {
        return "mastercard";
    } else {
        return "unknown";
    }
}
