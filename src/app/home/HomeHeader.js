"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

const HomeHeader = () => {

  const router = useRouter();

  return (
    <nav className='bg-gray-100 flex items-center justify-between p-2'>

      {/* LEFT: Logo */}
      <div className='flex items-center space-x-2 m-2'>
        <img src="/logo.png" alt="Logo" className='w-10 h-10 rounded-full object-cover' />
        <h1 className='text-xl font-bold'>Mobility hub</h1>
      </div>

      {/* CENTER: Menu */}
      <ul className='flex space-x-6 text-gray-500'>
        <li className='hover:text-green-600 cursor-pointer' onClick={() => router.push("/home")}>Home</li>
        <li className='hover:text-green-600 cursor-pointer' onClick={() => router.push("/maps")}>Maps</li>
        <li className='hover:text-green-600 cursor-pointer'>Vehicles</li>
        <li className='hover:text-green-600 cursor-pointer'>Gallery</li>
        <li className='hover:text-green-600 cursor-pointer' onClick={() => router.push("/about")}>About Us</li>
      </ul>

      {/* RIGHT: Profile */}
      <div className='flex items-center space-x-3 mr-4'>
        <img
          src="/logo.png" // replace with user image
          alt="Profile"
          className='w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 hover:border-green-500'
        />
      </div>

    </nav>
  )
}

export default HomeHeader;