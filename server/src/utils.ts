import Logger from "@peer-share/shared/utils/Logger";

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