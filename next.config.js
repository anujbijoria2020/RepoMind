/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    env:{
CUSTOM_KEY:process.env.CUSTOM_KEY,
    },
    allowedDevOrigins:['local-origin.dev','*.local-origin.dev','marta-unsaluted-magaly.ngrok-free.dev']
};

export default config;
