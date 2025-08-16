import { Router } from "express";
const router: Router = Router();
import * as controllerUsers from "../controllers/users.controller";

router.get("/not-friend", controllerUsers.getNotFriend);

router.get("/request", controllerUsers.getRequest);

router.get("/accept", controllerUsers.getAccept);

router.get("/friends", controllerUsers.getFriends);

router.post("/add-friend/:userId", controllerUsers.addFriend);

router.post("/cancel-friend/:userId", controllerUsers.cancelFriend);

router.post("/refuse-friend/:userId", controllerUsers.refuseFriend);

router.post("/accept-friend/:userId", controllerUsers.acceptFriend);

router.delete("/delete-friend/:userId", controllerUsers.deleteFriend);

export const usersRoute: Router = router;
