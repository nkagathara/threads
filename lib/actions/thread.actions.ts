"use server"

import { revalidatePath } from "next/cache";
import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDataBase } from "../mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

export async function createThread({text,author,communityId,path}: Params){
    try {
        connectToDataBase();
        console.log("communityId::",communityId);
        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
          );
        console.log("communityIdObject:::",communityIdObject);
        const createdThread = await Thread.create({
            text,
            author,
            community: communityIdObject,
        });

        if (communityIdObject) {
            // Update Community model
            await Community.findByIdAndUpdate(communityIdObject, {
              $push: { threads: createdThread._id },
            });
          }

        //Update User Model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id}
        })
        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function fetchPosts(pageNumber=1, pageSize = 20){
    try {
        connectToDataBase();
        // calculate the number of posts to skip
        let skipAmount = (pageNumber - 1) * pageSize;

        // Fetch the posts that have no parents(top level threads ...)
        const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
        path: "author",
        model: User,
        })
        .populate({
        path: "children", // Populate the children field
        populate: {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id name parentId image", // Select only _id and username fields of the author
        },
        });

        const totalPostsCount = await Thread.countDocuments({parentId : {$in: [null,undefined]}});

        const posts = await postsQuery.exec();

        const isNext = totalPostsCount > skipAmount + posts.length;

        return {posts, isNext};
        
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function fetchThreadById(id: string){
    try {

        // TODO: Populate Community
        connectToDataBase();
        const thread = await Thread.findOne({_id: id}).
        populate({
            path: 'author',
            model: User,
            select: '_id id name image'
        })
        .populate({
            path: 'children',
            populate: [
                {   
                    path: 'author',
                    model: User,
                    select: '_id id name parentId image'
                },
                {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: '_id id name parentId image'
                    }
                }
            ]
        }).exec();

        return thread;
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function addCommentToThread(threadId: string,commentText: string,userId: string,path: string){ 
    try {
        connectToDataBase();
        // Find the original thread by IDs
       const originalThread = await Thread.findById(threadId);

       if(!originalThread) {
        throw new Error (`Thread not found`);
       }

       const commentThread = new Thread({
        author: userId,
        text: commentText,
        parentId: threadId
       })

       // save comment thread
       let savedCommentThread = await commentThread.save();

       // Update the original thread to include new comment
       originalThread.children.push(savedCommentThread._id);
       await originalThread.save();
       revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}