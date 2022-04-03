/**
 * @file Declares Dislike data type representing relationship between
 * users and tuits, as in user dislikes a tuit
 */
import Tuit from "../tuits/Tuit";
import User from "../users/User";

/**
 * @typedef Dislike Represents likes relationship between a user and a tuit,
 * as in a user likes a tuit
 * @property {Tuit} tuit Tuit being disliked
 * @property {User} dislikedBy User disliking the tuit
 */

export default interface Dislike {
    tuit: Tuit,
    dislikedBy: User
};