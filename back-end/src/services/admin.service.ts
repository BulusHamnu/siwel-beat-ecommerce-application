import Order from "../models/order.schema.js";
import Track from "../models/track.schema.js";
import Profile from "../models/profile.schema.js";
import { type UserInterface } from "../models/user.schema.js";
import AppError from "../errors/appError.js";
import User from "../models/user.schema.js";

/* Get admin */
export const getAdmin = async (userId: string): Promise<UserInterface> => {
  const user: UserInterface | null = await User.findOne({ _id: userId });
  if (!user) throw new AppError("User not found.", 404, true);
  return user.removeUnwantedField();
};

/* Update profile */
export interface adminUpdateBody {
  firstname: string;
  username: string;
  lastname: string;
}

export const updateAdmin = async (
  userId: string,
  updates: adminUpdateBody
): Promise<UserInterface> => {
  const allowFields = ["username", "firstName", "lastName"];
  for (const key of Object.keys(updates) as (keyof adminUpdateBody)[]) {
    if (!allowFields.includes(key)) delete updates[key];
  }

  const user: UserInterface | null = await User.findOneAndUpdate(
    { _id: userId },
    { $set: updates },
    { new: true }
  );

  if (!user) throw new AppError("Unable to update admin.", 404, true);
  return user.removeUnwantedField();
};

/* Get dashboard */
export interface dashboardStatistics {
  newUsers: number;
  totalOrders: number;
  totalSuccessfulOrders: number;
  totalActiveBeat: number;
  totalBeat: number;
  totalUsers: number;
}

function getThreeDayRange(): { start: string; end: string } {
  const today = new Date();
  const date = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  const start = new Date(
    Date.UTC(year, month, date - 2, 0, 0, 0)
  ).toISOString();

  const end = new Date(
    Date.UTC(year, month, date, 23, 59, 59, 999)
  ).toISOString();

  return { start, end };
}

export const getDashboard = async (): Promise<dashboardStatistics> => {
  const { start, end } = getThreeDayRange();

  const dateQuery = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  // users stats
  const newUserQuery = Profile.find(dateQuery).countDocuments(); // Only last 3 days
  const totalUsersQuery = Profile.find().countDocuments();

  // beat stats
  const totalBeatQuery = Track.find().countDocuments();
  const totalActiveBeatQuery = Track.find({
    status: "active",
  }).countDocuments();

  //orders stats
  const totalOrdersQuery = Order.find().countDocuments();
  const totalSuccessOrdersQuery = Order.find({
    status: "paid",
  }).countDocuments();

  const [
    newUsers,
    totalUsers,
    totalBeat,
    totalActiveBeat,
    totalOrders,
    totalSuccessfulOrders,
  ] = await Promise.all([
    newUserQuery,
    totalUsersQuery,
    totalBeatQuery,
    totalActiveBeatQuery,
    totalOrdersQuery,
    totalSuccessOrdersQuery,
  ]);

  return {
    newUsers,
    totalUsers,
    totalBeat,
    totalActiveBeat,
    totalOrders,
    totalSuccessfulOrders,
  } as dashboardStatistics;
};
