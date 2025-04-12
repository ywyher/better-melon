import Image from "next/image";
import Link from "next/link";

export default function Logo() {
    return (
        <Link
            className="font-bold text-xl cursor-pointer max-w-full"
            href="/"
        >
            <Image
                src="/images/logo.png"
                alt="logo"
                width="125"
                height="125"
                className="object-cover"
            />
        </Link>
    )
}