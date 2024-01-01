'use client'

import Link from 'next/link'
import {sidebarLinks} from '../../constants/index.js';
import React from 'react'
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { SignedIn, SignOutButton, useAuth } from '@clerk/nextjs';


const LeftSidebar = () => {
  const router = useRouter();
  const pathName = usePathname();
  const {userId} = useAuth(); 
  return (
    <section className='custom-scrollbar leftsidebar'>
      <div className='w-full flex flex-1 flex-col gap-6 px-6'>
        
      {sidebarLinks.map((each)=>{
        const isActive = ((pathName.includes(each.route) && each.route.length > 1 ) || pathName === each.route);
        if(each.route === '/profile'){
          each.route = `${each.route}/${userId}`
        } 
         return(<Link href={each.route}key={each.label} className={`leftsidebar_link ${isActive && 'bg-primary-500'}`}>
            <Image src={each.imgURL} alt={each.label} width={24} height={24} />

            <p className='text-light-1 lg:hidden'>{each.label}</p>
          </Link>
        )})
      }
      </div>

      <div className='mt-10 px-6'>
          <SignedIn>
            <SignOutButton signOutCallback={() => router.push("/sign-in")}>
              <div className='flex cursor-pointer gap-4 p-4'>
                <Image src="/assets/logout.svg" alt="logout" width={24} height={24} />
                <p className='text-light-2 lg:hidden'>Logout</p>
              </div>
            </SignOutButton>
          </SignedIn>
      </div>
    </section>
  )
}

export default LeftSidebar