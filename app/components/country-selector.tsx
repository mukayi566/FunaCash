"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const countries = [
  {
    value: "zambia",
    label: "Zambia",
    flag: "🇿🇲",
    currency: "ZMW",
  },
  {
    value: "zimbabwe",
    label: "Zimbabwe",
    flag: "🇿🇼",
    currency: "ZWL",
  },
]

interface CountrySelectorProps {
  defaultCountry: string
}

export default function CountrySelector({ defaultCountry }: CountrySelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((country) => country.label === defaultCountry) || countries[0],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <div className="flex items-center">
            <span className="mr-2 text-2xl">{selectedCountry.flag}</span>
            <span className="font-medium">{selectedCountry.label}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search country..." className="h-9" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.value}
                  onSelect={() => {
                    setSelectedCountry(country)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="font-medium">{country.label}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedCountry.value === country.value ? "opacity-100 text-blue-600" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
