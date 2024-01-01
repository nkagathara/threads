'use client'
import { sidebarLinks } from '@/constants'
import React from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const Bottombar = () => {
  const router = useRouter();
  const pathName = usePathname();
  return (
    <section className='bottombar'>
      <div className='bottombar_container'>
      {sidebarLinks.map((each)=>{
        const isActive = ((pathName.includes(each.route) && each.route.length > 1 ) || pathName === each.route) 
         return(<Link href={each.route}key={each.label} className={`bottombar_link ${isActive && 'bg-primary-500'}`}>
            <Image src={each.imgURL} alt={each.label} width={24} height={24} />

            <p className='text-subtle-medium text-light-1 max-sm:hidden'>{each.label.split(/\s+/)[0]}</p>
          </Link>
        )})
      }
      </div>
    </section>
  )
}

export default Bottombar