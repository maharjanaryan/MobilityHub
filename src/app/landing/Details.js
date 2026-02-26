import React from 'react'

const Details = () => {
  return (
    <div className='bg-green-100 mb-10'>
      <h1 className='font-bold flex justify-center text-5xl p-10'>Our Eco Impact</h1>
      
      <div className='flex gap-10 ml-30 mt-10 mr-30'>

      <div className='py-6 px-25 rounded-2xl bg-white mb-15'>
        <h2 className=''>12,213</h2>
        <p className='text-sm text-gray-400'>kg CO2 saved</p>
      </div>
      <div className=' py-6 px-25 rounded-2xl bg-white mb-15'>
        <h2 >8,320</h2>
        <p className='text-sm text-gray-400'>Green Rides</p>
      </div>
      <div className='py-6 px-25 rounded-2xl bg-white mb-15'>
        <h2 >4.9</h2>
        <p className='text-sm text-gray-400'>Avg Rating</p>
      </div>
      <div className='py-6 px-25 rounded-2xl bg-white mb-15'>
        <h2>150+</h2>
        <p className='text-sm text-gray-400'>Location</p>
      </div>



      </div>
      
    </div>
  )
}

export default Details
