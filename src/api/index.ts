import bodyParser from "body-parser";
import express from "express";

import menu from "./menu";

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Register the USSD APP
router.post("/", (req, res) => {
  menu(req).run(req.body, (ussdResult: any) => {
    res.send(ussdResult);
  });
});

export default router;
