
import mongoose, { Document, Types, mongo } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  status: string;
  password: string;
  role: string;
  subordinates: Types.ObjectId[];
  transactions: Types.ObjectId[];
  lastLogin: Date | null;
  loginTimes: number;
  totalRecharged: number;
  totalRedeemed: number;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId | null;

}

export interface IPlayer extends Document {
  username: string;
  password: string;
  role: string;
  status: string;
  lastLogin: Date | null;
  loginTimes: number;
  totalRecharged: number;
  totalRedeemed: number;
  credits: number;
  favouriteGames: string[];
  transactions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId | null;
}
