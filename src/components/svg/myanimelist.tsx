import * as React from "react"
import { SVGProps } from "react"
const Myanimelist = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={256} height={256} {...props}>
    <path
      d="M0 0h256v256H0z"
      style={{
        opacity: 1,
        fill: "#2e51a2",
        fillOpacity: 1,
        strokeWidth: 0.999999,
        strokeLinejoin: "round",
        paintOrder: "stroke fill markers",
      }}
    />
    <path
      d="M30.639 88.41v68.706h17.76v-41.91l15.47 19.773 16.678-19.773v41.91h17.76V88.41h-17.76L63.87 109.823 48.4 88.41ZM182.498 88.41v68.706h39.08l3.783-14.657h-25.103v-54.05ZM149.652 88.41c-21.643 0-35.067 10.21-39.37 25.392-4.199 14.818.342 34.371 10.288 53.789l14.857-10.475s-7.064-9.217-8.394-23.035h21.984v23.035h19.734v-51.68h-19.734v14.967H130.8c1.717-11.197 8.295-17.308 15.469-17.308h25.816l-5.123-14.686z"
      style={{
        fill: "#fff",
        fillOpacity: 1,
        strokeLinejoin: "round",
        paintOrder: "stroke fill markers",
      }}
    />
  </svg>
)
export default Myanimelist
