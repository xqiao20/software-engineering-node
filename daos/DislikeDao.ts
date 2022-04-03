/**
 * @file Implements DAO managing data storage of dislikes. Uses mongoose DislikeModel
 * to integrate with MongoDB
 */

import DislikeDaoI from "../interfaces/DislikeDaoI";
import DislikeModel from "../mongoose/dislikes/DislikeModel";
import Dislike from "../models/dislike/Dislike";

/**
 * @class DislikeDao Implements Data Access Object managing data storage
 * of Likes
 * @property {DislikeDao} dislikeDao Private single instance of LikeDao
 */
export default class DislikeDao implements DislikeDaoI {
    private static dislikeDao: DislikeDao | null = null;

    /**
     * Creates singleton DAO instance
     * @returns DislikeDao
     */
    public static getInstance = (): DislikeDao => {
        if(DislikeDao.dislikeDao === null) {
            DislikeDao.dislikeDao = new DislikeDao();
        }
        return DislikeDao.dislikeDao;
    }
    private constructor() {}


    /**
     * Uses DislikeModel to retrieve all dislike documents of the given tuit from dislikes collection
     * @param {string} tid primary key of the tuit
     * @returns Promise To be notified when the dislikes are retrieved from
     * database
     */

    findAllUsersThatDislikedTuit = async (tid: string): Promise<Dislike[]> =>
        DislikeModel.find({tuit:tid})
            .populate("dislikedBy")
            .exec();


    /**
     * Uses LikeModel to retrieve all dislike documents disliked by the given user from dislikes collection
     * @param {string} uid primary key of the user
     * @returns Promise To be notified when the dislikes are retrieved from
     * database
     */
    findAllTuitsDislikedByUser = async (uid: string): Promise<Dislike[]> =>
        DislikeModel.find({dislikedBy:uid})
            .populate({
                path:"tuit",
                populate:{
                    path:"postedBy"
                }
            })
            .exec();

    /**
     * Remove dislike instance of the given user dislikes the given tuit.
     * @param {string} uid Primary key of the given user
     * @param {string} tid primary key of the given tuit
     * @returns Promise To be notified when the dislike is removed from
     * database
     */
    userUnDislikesTuit = async (uid: string, tid: string): Promise<any> =>
        DislikeModel.deleteOne({tuit:tid, dislikedBy: uid});

    /**
     * Use dislike model t0 retrieve dislike instance of the given user dislikes the given tuit.
     * @param {string} uid Primary key of the given user
     * @param {string} tid primary key of the given tuit
     * @returns Promise To be notified when the dislike is retrieved from
     * database
     */
    findUserDislikesTuit = async (uid: string, tid: string): Promise<any> =>
        DislikeModel.findOne({tuit: tid, dislikedBy: uid});

    /**
     * Insert like instance of the given user likes the given tuit.
     * @param {string} uid Primary key of the given user
     * @param {string} tid primary key of the given tuit
     * @returns Promise To be notified when the like is inserted into
     * database
     */
    userDislikesTuit = async (uid: string, tid: string): Promise<Dislike> =>
        DislikeModel.create({tuit: tid, dislikedBy: uid});

    /**
     * Count the dislike instance of tuits disliked by the given user.
     * @param {string} tid primary key of the given tuit
     * @returns Promise To be notified when the like is removed from
     * database
     */
    countHowManyDislikedTuit = async (tid: string): Promise<any> =>
        DislikeModel.count({tuit: tid});
}