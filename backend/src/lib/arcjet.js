import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { ENV } from "./env.js";

const aj = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),

    detectBot({
      // Development mein block na ho is liye DRY_RUN kar dein
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",

      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "POSTMAN", 
      ],
    }),

    slidingWindow({
        mode: "LIVE",
        max: 100,
        interval: 60,
    })
  ],
});

export default aj;