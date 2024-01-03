'use client'
import React, { ChangeEvent, useState } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { UserValidation } from '@/lib/validation/user';
import * as z from "zod"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Textarea } from '../ui/textarea';
import { isBase64Image } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';
import { updateUser } from '@/lib/actions/user.actions';
import { usePathname, useRouter } from 'next/navigation';
import { ThreadValidation } from '@/lib/validation/thread';
import { createThread } from '@/lib/actions/thread.actions';
import { useOrganization } from '@clerk/nextjs';


interface Props {
    userId: string;
  }
  

const PostThread = ({userId}: Props) => {
    const pathname = usePathname();
    const router = useRouter(); 
    const {organization} = useOrganization();
    const form = useForm({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: "",
            accountId: userId
        }
    })
    const onSubmit = async (values: z.infer<typeof ThreadValidation>) =>{
        console.log("values::",values);
        console.log("organization::",organization);
        await createThread({
            text: values.thread,
            author: userId,
            communityId: organization? organization.id : null,
            path: pathname
        });
        router.push("/");
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 flex flex-col justify-start gap-10">
            <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
                <FormItem className='flex flex-col gap-4'>
                <FormLabel className='text-base-semibold text-light-2'>Content</FormLabel>
                <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                    <Textarea rows={15} className='account-form_input no-focus' {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
                )}
            />
            <Button type='submit' className='bg-primary-500'>Post Thread</Button>
            </form>
        </Form>    
    )
}

export default PostThread