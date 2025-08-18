import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import React from 'react'

const WeightSection = ({ weight }: { weight: number }) => {
  return (
    <div className='flex flex-col justify-center items-center gap-2 w-fit'>
    <p className='text-center'>peso (kg)</p>

    <div className='flex flex-col justify-center items-center gap-2 w-fit'>
        <Button variant="outline">
            <Plus />
        </Button>
        <p>{weight}</p>
        <Button variant="outline">
            <Minus />
        </Button>
    </div>
  </div>
  )
}

export default WeightSection