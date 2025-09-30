import React from 'react'
import { PackageX } from 'lucide-react'

export default function NoData() {
  return (
          <div className='flex justify-center items-center gap-[0.5rem] min-h-full'><PackageX size={50} /><p className='text-[20px] font-bold'>No Data</p></div>
  )
}
