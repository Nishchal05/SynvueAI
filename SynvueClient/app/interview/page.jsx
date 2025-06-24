import React from 'react'
import { Suspense } from 'react'
import InterviewRoom from '../_component/interviewpage'
const page = () => {
  return (
    <Suspense>
      <InterviewRoom/>
    </Suspense>
  )
}

export default page