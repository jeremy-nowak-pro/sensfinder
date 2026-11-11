const sensFormat = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const cmFormat = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatSens = (value: number): string => sensFormat.format(value);
export const formatCm = (value: number): string => `${cmFormat.format(value)} cm/360`;
