/**
 * @file Controller RESTful Web service API for Dislikes resource
 */
import {Express, Request, Response} from "express";
import DislikeDao from "../daos/DislikeDao";
import DislikeControllerI from "../interfaces/DislikeControllerI";
import TuitDao from "../daos/TuitDao";

/**
 * @class TuitController Implements RESTful Web service API for Dislikes resource.
 * Defines the following HTTP endpoints:
 * <ul>
 *     <li>GET /api/users/:uid/Dislikes to retrieve all the tuits Disliked by a user
 *     </li>
 *     <li>GET /api/tuits/:tid/Dislikes to retrieve all users that Disliked a tuit
 *     </li>
 *     <li>POST /api/users/:uid/Dislikes/:tid to record that a user Dislikes a tuit
 *     </li>
 *     <li>DELETE /api/users/:uid/unDislikes/:tid to record that a user
 *     no londer Dislikes a tuit</li>
 * </ul>
 * @property {DislikeDao} DislikeDao Singleton DAO implementing Dislikes CRUD operations
 * @property {DislikeController} DislikeController Singleton controller implementing
 * RESTful Web service API
 */
export default class DislikeController implements DislikeControllerI {
    private static dislikeDao: DislikeDao = DislikeDao.getInstance();
    private static tuitDao: TuitDao = TuitDao.getInstance();
    private static dislikeController: DislikeController | null = null;
    /**
     * Creates singleton controller instance
     * @param {Express} app Express instance to declare the RESTful Web service
     * API
     * @return TuitController
     */
    public static getInstance = (app: Express): DislikeController => {
        if(DislikeController.dislikeController === null) {
            DislikeController.dislikeController = new DislikeController();
            app.get("/api/users/:uid/dislikes", DislikeController.dislikeController.findAllTuitsDislikedByUser);
            app.get("/api/tuits/:tid/dislikes", DislikeController.dislikeController.findAllUsersThatDislikedTuit);
            app.put("/api/users/:uid/dislikes/:tid", DislikeController.dislikeController.userTogglesTuitDislikes);
            app.get("/api/users/:uid/dislikes/:tid", DislikeController.dislikeController.userAlreadyDislikedTuit);
        }
        return DislikeController.dislikeController;
    }

    private constructor() {}

    /**
     * Retrieves all users that Disliked a tuit from the database
     * @param {Request} req Represents request from client, including the path
     * parameter tid representing the Disliked tuit
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the user objects
     */
    findAllUsersThatDislikedTuit = (req: Request, res: Response) =>
        DislikeController.dislikeDao.findAllUsersThatDislikedTuit(req.params.tid)
            .then(dislikes => res.json(dislikes));

    /**
     * Retrieves all tuits Disliked by a user from the database
     * @param {Request} req Represents request from client, including the path
     * parameter uid representing the user Disliked the tuits
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the tuit objects that were Disliked
     */
    findAllTuitsDislikedByUser = (req: Request, res: Response) => {
        const uid = req.params.uid;
        // @ts-ignore
        const profile = req.session['profile'];
        if(uid === "me" && !profile){
            res.sendStatus(403);
            return;
        }
        const userId = uid === "me" && profile ?
            profile._id : uid;

        DislikeController.dislikeDao.findAllTuitsDislikedByUser(userId)
            .then(dislikes => {
                const dislikesNonNullTuits = dislikes.filter(dislike => dislike.tuit);
                const tuitsFromDislikes = dislikesNonNullTuits.map(dislike => dislike.tuit);
                res.json(tuitsFromDislikes);
            });
    }


    /**
     * @param {Request} req Represents request from client, including the
     * path parameters uid and tid representing the user that is liking the tuit
     * and the tuit being Disliked
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the new Dislikes that was inserted in the
     * database
     */
    userTogglesTuitDislikes = async (req: Request, res: Response) => {
        const dislikeDao = DislikeController.dislikeDao;
        const tuitDao = DislikeController.tuitDao;
        const uid = req.params.uid;
        const tid = req.params.tid;

        // @ts-ignore
        const profile = req.session['profile'];
        if(uid === "me" && !profile){
            res.sendStatus(403);
            return;
        }
        const userId = uid === "me" && profile ?
            profile._id : uid;
        try {
            const userAlreadyDislikedTuit = await dislikeDao.findUserDislikesTuit(userId, tid);
            const howManyDislikedTuit = await dislikeDao.countHowManyDislikedTuit(tid);
            let tuit = await tuitDao.findTuitById(tid);
            if (userAlreadyDislikedTuit) {
                await dislikeDao.userUnDislikesTuit(userId, tid);
                tuit.stats.dislikes = howManyDislikedTuit - 1;
            } else {
                await DislikeController.dislikeDao.userDislikesTuit(userId, tid);
                tuit.stats.dislikes = howManyDislikedTuit + 1;
            };
            await tuitDao.updateDislikes(tid, tuit.stats);
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(404);
        }
    }

    userAlreadyDislikedTuit = (req: Request, res: Response)=> {
        const uid = req.params.uid;
        const tid = req.params.tid;
        // @ts-ignore
        const profile = req.session['profile'];
        if(uid === "me" && !profile){
            res.sendStatus(403);
            return;
        }

        const userId = uid === "me" && profile ?
            profile._id : uid;
        DislikeController.dislikeDao.findUserDislikesTuit(userId, tid)
            .then((dislike) => res.json(dislike))
    }
};