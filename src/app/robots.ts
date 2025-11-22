import type { MetadataRoute } from "next";

const generateRobots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
  };
};

export default generateRobots;
