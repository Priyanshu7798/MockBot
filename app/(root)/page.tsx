import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from "next/image"
import React from 'react'
import InterviewCard from '@/components/InterviewCard'
import { getCurrentUser, getInterviewByUserId, getLatestInterview } from '@/lib/actions/auth.action'

export default async function Page() {

  const user = await getCurrentUser();

  // optimize way
  const [userInterviews,latestInterviews] = await Promise.all([
      await getInterviewByUserId(user?.id!),
      await getLatestInterview({userId : user?.id!})
  ])


  // not optimized %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // const userInterviews = await getInterviewByUserId(user?.id!)
  // const latestInterviews = await getLatestInterview({userId : user?.id!})
  
  
  const hasPastIntervies = userInterviews?.length! > 0 ;
  const hasUpcomingInterviews = latestInterviews?.length! >0

  return(
    <>
      <section className='card-cta mt-5'>
        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Get Interview-Ready with AI !! Practice!! and Feeback</h2>

          <p className='text-lg'>
            Practice on real Interview questions and get instant feedback
          </p>

          <Button asChild className='btn-primary'>
            <Link href='/interview'>Start an Interview</Link>
          </Button>
        </div>

        <Image src='/robot.png' alt= 'robo-dude' width={400} height={400} className='max-sm:hidden'/>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Inteviews</h2>

        <div className='interviews-section'>
          { hasPastIntervies ? (
            userInterviews?.map((interview)=>(
              <InterviewCard {...interview} key={interview.id}/>
            ))
          ):(
              <p>You haven&apos;t taken the interview yet</p>
          )}
        </div>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Take an Interview</h2>

        <div className='interviews-section'>
        { hasUpcomingInterviews ? (
            latestInterviews?.map((interview)=>(
              <InterviewCard {...interview} key={interview.id}/>
            ))
          ):(
              <p> Ther is no Interview available</p>
          )}\
        </div>
      </section>
    </>
  )
}