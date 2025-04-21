import { ConnectionProviders } from "@/types/auth";
import { ComponentType, SVGProps } from "react";

export type Option = {
    value: string;
    label: string;
};

export type AnimeListProivder = {
    name: ConnectionProviders
    icon: ComponentType<SVGProps<SVGSVGElement>>
}

export type SyncStrategy = 'always' | 'ask' | 'never'