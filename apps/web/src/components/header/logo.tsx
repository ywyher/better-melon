import Image from "next/image";
import Link from "next/link";

export default function Logo() {
    return (
        <Link
            className="font-bold text-xl cursor-pointer w-fit h-fit px-2 rounded-md bg-background"
            href="/"
        >
            <p className="text-foreground">Better Melon</p>
        </Link>
    )
}