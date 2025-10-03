import Router from "express";

const router = Router();
import { healthcheck } from "../controllers/healthcheck.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/healthCheck").get(verifyJWT, healthcheck);

export default router;
