/**
 * @file Implement mongoose schema for dislikes
 */
import mongoose, {Schema} from "mongoose";
import Dislike from "../../models/dislike/Dislike";

/**
 * @typedef Dislike Represents likes relationship between a user and a tuit,
 * as in a user likes a tuit
 * @property {ObjectId} tuit Primary key of tuit being disliked
 * @property {ObjectId} dislikedBy Primary key of user disliking the tuit
 */
const DislikeSchema = new mongoose.Schema<Dislike>({
    tuit: {type: Schema.Types.ObjectId, ref: "TuitModel"},
    dislikedBy: {type: Schema.Types.ObjectId, ref: "UserModel"},
}, {collection: "dislikes"});
export default DislikeSchema;