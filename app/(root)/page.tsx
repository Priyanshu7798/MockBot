import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from "next/image"
import React from 'react'
import { dummyInterviews } from '@/constants'
import InterviewCard from '@/components/InterviewCard'

export default function Page() {
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
          {dummyInterviews.map((interview)=>(
            <InterviewCard {...interview} key={interview.id}/>
          ))}
        </div>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Take an Interview</h2>

        <div className='interviews-section'>
          {dummyInterviews.map((interview)=>(
              <InterviewCard {...interview} key={interview.id}/>
          ))}

          {/* <p>you havent taken any interview</p> */}
        </div>
      </section>
    </>
  )
}