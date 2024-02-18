import mongoose, { InferSchemaType, ObjectId } from "mongoose";
import { config } from 'dotenv';
config();

const { MONGO_URL } = process.env;
if (!MONGO_URL) { throw new Error("MONGO_URL is missing in the environment") }

export async function getMongoDB() {
    await mongoose.connect(MONGO_URL!);
    return mongoose;
}

export type TxnType =
    "Approval"
    | "Borrow"
    | "Deposit"
    | "Redeem"
    | "Swap"
    | "Transfer";

export type TxnStatus =
    "Failed"
    | "Pending"
    | "Success";

export const CircleTransactionSchema = new mongoose.Schema({
    nonce: { type: Number, required: true },
    bridgeFee: {type: Number, required: false},
    burnToken: { type: String, required: false },
    amount: { type: Number, required: true },
    depositor: { type: String, required: true },
    destinationFee: {type: Number, required: false, index: false },
    mintRecipient: { type: String, required: true },
    destinationDomain: { type: Number, required: true, index: true },
    destinationTokenMessenger: { type: String, required: true },
    destinationCaller: { type: String, required: true },
    originalDomain: { type: Number, required: true, index: true },
    originFee: {type: Number, required: true, index: false },
    sender: { type: String, required: true, index: true },
    burnHash: { type: String, required: true, index: true },
    attestation: { type: String, required: false },
    claimHash: { type: String, required: false, index: true },
    symbol: { type: String, required: true, index: true },
    start: {type: Date, required: true},
    finished: {type: Date, required: false},
});

export type TCircleTransaction = InferSchemaType<typeof CircleTransactionSchema> & {_id?: ObjectId};

export const CircleTransaction = mongoose.model('CircleTransaction', CircleTransactionSchema);

export const CoinPriceSchema = new mongoose.Schema({
    Name: {type: String, required: false},
    USDPrice: {type: Number, required: false},
    LastUpdated: {type: Date, required: false},
});

export type TCoinPrice = InferSchemaType<typeof CoinPriceSchema>;

export const CoinPrice = mongoose.model('CoinPrice', CoinPriceSchema);

const db = getMongoDB();
db.then(() => console.log("MondoDB connected"))