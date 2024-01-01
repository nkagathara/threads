'use server'

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import { connectToDataBase } from "../mongoose";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
    userId : string,
    username: string, 
    name: string, 
    bio: string, 
    image: string, 
    path: string
}
export async function updateUser({userId,username, name, bio, image, path} : Params): Promise<void> {
    // await 
    try {
        connectToDataBase();
        await User.findOneAndUpdate(
            {id : userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true
            },
            { upsert: true}
        );
        if(path === '/profile/edit'){

            revalidatePath(path)
        }
    } catch (error : any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
    
}

export async function fetchUser(userId: string){
    try {
        connectToDataBase();
        return await User.findOne({id: userId})
        // .populate(
        //     path: 'communities',
        //     model: Community
        // )
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function fetchUserPosts(userId: string){
    try {
        connectToDataBase();
        const threads =  await User.findOne({id: userId})
        .populate({
            path: 'threads',
            model: Thread,
            populate: {
                path: 'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            }
        }       
        )
        return threads;
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function fetchUsers ({userId,searchString = "",pageNumber = 1,pageSize = 20,sortBy='desc'}:{userId: string,searchString?:string,pageNumber?:number,pageSize?:number,sortBy?:SortOrder}){
    try {
        connectToDataBase();

        const skipAmount = (pageNumber -1) * pageSize;
        const regex = new RegExp(searchString,"i");
        const query: FilterQuery<typeof User> = {
            id: {$ne:userId }
        }
        if(searchString.trim() !== ''){
            query.$or = [
                {username: {$regex : regex}},
            ]
        }
        const sortOptions = { createdAt: sortBy}

        const userQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);

        const totalUserCount = await User.countDocuments(query);
        const users = await userQuery.exec();    

        const isNext = totalUserCount > skipAmount + users.length;

        return { users, isNext}
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function getActivity (userId:string){
    try {
        connectToDataBase();
        console.log("userId::",userId);
        // Find all threads created by users
        const userThreads = await Thread.find({author:userId});
        // Collect all child thread id(replies) from the children

        const childThreadIds = userThreads.reduce((acc,userThread)=>{
            return acc.concat(userThread.children);
        },[])
        console.log("childThreadIds::",childThreadIds);
        const replies = await Thread.find({
            _id:{ $in: childThreadIds},
            author:{$ne: userId}
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })
        console.log("replies:",replies);
        return replies;
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}