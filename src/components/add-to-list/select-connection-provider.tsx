"use client"

import { AnimeListProivder } from "@/types";
import { Dispatch, SetStateAction } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { animeListProviders } from "@/lib/constants";

type SelectConnectionProviderProps = {
    selectedProvider: AnimeListProivder
    setSelectedProvider: Dispatch<SetStateAction<AnimeListProivder>>
}

export default function SelectConnectionProvider({ selectedProvider, setSelectedProvider }: SelectConnectionProviderProps) {
    return (
      <Select
        onValueChange={(v) => {
          const providerInfo = animeListProviders.find(a => a.name == v)
          if(!providerInfo) return;
          setSelectedProvider(providerInfo)
        }}
        value={selectedProvider.name}
      >
        <SelectTrigger className="cursor-pointer">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedProvider && <>
                <selectedProvider.icon className="w-5 h-5" />
                <span>{selectedProvider.name}</span>
              </>}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {animeListProviders.map((provider, idx) => (
            <SelectItem
              key={idx}
              value={provider.name}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <provider.icon className="w-5 h-5" />
                <span>{provider.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }