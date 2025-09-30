"use client"

import { SelectTrigger,Select,SelectContent,SelectValue,SelectItem } from '@/components/ui/select'
import axios from 'axios'
import React, { useEffect,useState } from 'react'


type Props={
    years:string[]
    setYearParams: (year:string)=>void
    yearParam:string   
}

export const YearPicker = ({setYearParams,years,yearParam}:Props) => {

 
  return (
    <Select value={yearParam}  onValueChange={(value)=>setYearParams(value)}>
        <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder="select the year" />
        </SelectTrigger>
        <SelectContent>
            {years.map((year,index)=>(
                <SelectItem key={index} value={year}>{year}</SelectItem>
            ))}
        </SelectContent>    
    </Select>
  )
}
