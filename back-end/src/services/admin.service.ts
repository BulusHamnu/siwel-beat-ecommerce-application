import Order from "../models/order.schema.js";
import Track from "../models/track.schema.js";
import Profile from "../models/profile.schema.js";

/* Get dashboard */
export interface dashboardStatistics {
  newUsers: number;
  totalOrders: number;
  totalSuccessfulOrders: number;
  totalPublishedBeat: number;
  totalBeat: number;
  totalUsers: number;
}

function getThreeDayRange(): { start: string; end: string } {
  const today = new Date();
  const date = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  const start = new Date(
    Date.UTC(year, month, date - 2, 0, 0, 0),
  ).toISOString();

  const end = new Date(
    Date.UTC(year, month, date, 23, 59, 59, 999),
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
  const totalPublishedBeatQuery = Track.find({
    status: "published",
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
    totalPublishedBeat,
    totalOrders,
    totalSuccessfulOrders,
  ] = await Promise.all([
    newUserQuery,
    totalUsersQuery,
    totalBeatQuery,
    totalPublishedBeatQuery,
    totalOrdersQuery,
    totalSuccessOrdersQuery,
  ]);

  return {
    newUsers,
    totalUsers,
    totalBeat,
    totalPublishedBeat,
    totalOrders,
    totalSuccessfulOrders,
  } as dashboardStatistics;
};
