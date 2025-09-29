import Logger from "@peer-share/shared/utils/Logger";
import { Iuser } from "./db/models/user";
import jwt from "jsonwebtoken";

export const logger = Logger.getInstance();

export const getUptime = () => {
  const seconds = Math.floor(process.uptime());
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export const getMemoryUsage = () => {
  return Object.entries(process.memoryUsage()).map(([key, value]) => ({
    [key]: `${value / 1024 / 1024} MB`,
  }));
};


// Generate JWT Token
export const generateToken = (user: Iuser) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};


