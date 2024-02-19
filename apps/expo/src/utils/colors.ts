export type Color = keyof typeof colors;

export const colors = {
    black: "#000",
    white: "#fff",
    gray: "#666",
    red: "#EF4444",
    primaryBlue: "#3B82F6",
    yellow: "#FBBF24",
};

export function disabledColor(color: string) {
    return lightenHexColor(color, 50);
}

function lightenHexColor(hex: string, amount: number): string {
    // Ensure the hex code is valid and remove the hash at the start if it's there.
    if (hex.length !== 7 || hex[0] !== "#") {
        throw new Error("Invalid hex color format. Expected format: #RRGGBB");
    }

    // Convert hex to RGB
    let r: number = parseInt(hex.slice(1, 3), 16);
    let g: number = parseInt(hex.slice(3, 5), 16);
    let b: number = parseInt(hex.slice(5, 7), 16);

    // Lighten the color
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);

    // Convert back to hex
    const rHex: string = r.toString(16).padStart(2, "0");
    const gHex: string = g.toString(16).padStart(2, "0");
    const bHex: string = b.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
}
