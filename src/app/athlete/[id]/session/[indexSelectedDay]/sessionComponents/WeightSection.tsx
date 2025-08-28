import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import React from 'react'

const WeightSection = ({ weight, setWeight }: { weight: number, setWeight: (weight: number) => void }) => {

  const handlePlus = () => {
    setWeight(weight + 2.5);
  }

  const handleMinus = () => {
    if (weight > 0) {
      setWeight(weight - 2.5);
    }
  }
  return (
    <div className='flex flex-col justify-center items-center gap-2 w-fit'>
    <p className='text-center'>peso (kg)</p>

    <div className='flex flex-col justify-center items-center gap-2 w-fit'>
        <Button variant="outline" onClick={handlePlus}>
            <Plus />
        </Button>
        <p>{weight.toFixed(1)}</p>
        <Button variant="outline" onClick={handleMinus}>
            <Minus />
        </Button>
    </div>
  </div>
  )
}

export default WeightSection