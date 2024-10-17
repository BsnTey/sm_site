export interface Payment {
    id: string;
    transactionId: number | null;
    userTelegramName: string;
    completedAt: Date | null;
    amount: number;
    amountCredited: number;
    status: StatusPayment;
    receiptUrl: string | null;
    statusHistory: StatusHistory[];
}

export interface StatusHistory {
    status: StatusPayment;
    date: string;
}

export type StatusPayment = (typeof StatusPayment)[keyof typeof StatusPayment]

const StatusPayment = {
    Created: 'Created',
    Transfered: 'Transfered',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
    Proceedings: 'Proceedings'
};