"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            xmlSpace="preserve"
            overflow="hidden"
            viewBox="0 0 268.152 273.883"
            className="h-5 w-5" aria-hidden="true" fill="currentColor"
        >
            <defs>
                <linearGradient id="a">
                    <stop offset="0" stopColor="#0fbc5c"></stop>
                    <stop offset="1" stopColor="#0cba65"></stop>
                </linearGradient>
                <linearGradient id="g">
                    <stop offset="0.231" stopColor="#0fbc5f"></stop>
                    <stop offset="0.312" stopColor="#0fbc5f"></stop>
                    <stop offset="0.366" stopColor="#0fbc5e"></stop>
                    <stop offset="0.458" stopColor="#0fbc5d"></stop>
                    <stop offset="0.54" stopColor="#12bc58"></stop>
                    <stop offset="0.699" stopColor="#28bf3c"></stop>
                    <stop offset="0.771" stopColor="#38c02b"></stop>
                    <stop offset="0.861" stopColor="#52c218"></stop>
                    <stop offset="0.915" stopColor="#67c30f"></stop>
                    <stop offset="1" stopColor="#86c504"></stop>
                </linearGradient>
                <linearGradient id="h">
                    <stop offset="0.142" stopColor="#1abd4d"></stop>
                    <stop offset="0.248" stopColor="#6ec30d"></stop>
                    <stop offset="0.312" stopColor="#8ac502"></stop>
                    <stop offset="0.366" stopColor="#a2c600"></stop>
                    <stop offset="0.446" stopColor="#c8c903"></stop>
                    <stop offset="0.54" stopColor="#ebcb03"></stop>
                    <stop offset="0.616" stopColor="#f7cd07"></stop>
                    <stop offset="0.699" stopColor="#fdcd04"></stop>
                    <stop offset="0.771" stopColor="#fdce05"></stop>
                    <stop offset="0.861" stopColor="#ffce0a"></stop>
                </linearGradient>
                <linearGradient id="f">
                    <stop offset="0.316" stopColor="#ff4c3c"></stop>
                    <stop offset="0.604" stopColor="#ff692c"></stop>
                    <stop offset="0.727" stopColor="#ff7825"></stop>
                    <stop offset="0.885" stopColor="#ff8d1b"></stop>
                    <stop offset="1" stopColor="#ff9f13"></stop>
                </linearGradient>
                <linearGradient id="b">
                    <stop offset="0.231" stopColor="#ff4541"></stop>
                    <stop offset="0.312" stopColor="#ff4540"></stop>
                    <stop offset="0.458" stopColor="#ff4640"></stop>
                    <stop offset="0.54" stopColor="#ff473f"></stop>
                    <stop offset="0.699" stopColor="#ff5138"></stop>
                    <stop offset="0.771" stopColor="#ff5b33"></stop>
                    <stop offset="0.861" stopColor="#ff6c29"></stop>
                    <stop offset="1" stopColor="#ff8c18"></stop>
                </linearGradient>
                <linearGradient id="d">
                    <stop offset="0.408" stopColor="#fb4e5a"></stop>
                    <stop offset="1" stopColor="#ff4540"></stop>
                </linearGradient>
                <linearGradient id="c">
                    <stop offset="0.132" stopColor="#0cba65"></stop>
                    <stop offset="0.21" stopColor="#0bb86d"></stop>
                    <stop offset="0.297" stopColor="#09b479"></stop>
                    <stop offset="0.396" stopColor="#08ad93"></stop>
                    <stop offset="0.477" stopColor="#0aa6a9"></stop>
                    <stop offset="0.568" stopColor="#0d9cc6"></stop>
                    <stop offset="0.667" stopColor="#1893dd"></stop>
                    <stop offset="0.769" stopColor="#258bf1"></stop>
                    <stop offset="0.859" stopColor="#3086ff"></stop>
                </linearGradient>
                <linearGradient id="e">
                    <stop offset="0.366" stopColor="#ff4e3a"></stop>
                    <stop offset="0.458" stopColor="#ff8a1b"></stop>
                    <stop offset="0.54" stopColor="#ffa312"></stop>
                    <stop offset="0.616" stopColor="#ffb60c"></stop>
                    <stop offset="0.771" stopColor="#ffcd0a"></stop>
                    <stop offset="0.861" stopColor="#fecf0a"></stop>
                    <stop offset="0.915" stopColor="#fecf08"></stop>
                    <stop offset="1" stopColor="#fdcd01"></stop>
                </linearGradient>
                <linearGradient
                    xlinkHref="#a"
                    id="s"
                    x1="219.7"
                    x2="254.467"
                    y1="329.535"
                    y2="329.535"
                    gradientUnits="userSpaceOnUse"
                ></linearGradient>
                <radialGradient
                    xlinkHref="#b"
                    id="m"
                    cx="109.627"
                    cy="135.862"
                    r="71.46"
                    fx="109.627"
                    fy="135.862"
                    gradientTransform="matrix(-1.93688 1.043 1.45573 2.55542 290.525 -400.634)"
                    gradientUnits="userSpaceOnUse"
                ></radialGradient>
                <radialGradient
                    xlinkHref="#c"
                    id="n"
                    cx="45.259"
                    cy="279.274"
                    r="71.46"
                    fx="45.259"
                    fy="279.274"
                    gradientTransform="matrix(-3.5126 -4.45809 -1.69255 1.26062 870.8 191.554)"
                    gradientUnits="userSpaceOnUse"
                ></radialGradient>
                <radialGradient
                    xlinkHref="#d"
                    id="l"
                    cx="304.017"
                    cy="118.009"
                    r="47.854"
                    fx="304.017"
                    fy="118.009"
                    gradientTransform="matrix(2.06435 0 0 2.59204 -297.679 -151.747)"
                    gradientUnits="userSpaceOnUse"
                ></radialGradient>
                <radialGradient
                    xlinkHref="#e"
                    id="o"
                    cx="181.001"
                    cy="177.201"
                    r="71.46"
                    fx="181.001"
                    fy="177.201"
                    gradientTransform="matrix(-.24858 2.08314 2.96249 .33417 -255.146 -331.164)"
                    gradientUnits="userSpaceOnUse"
                ></radialGradient>
                <radialGradient
                    xlinkHref="#f"
                    id="p"
                    cx="207.673"
                    cy="108.097"
                    r="41.102"
                    fx="207.673"
                    fy="108.097"
                    gradientTransform="matrix(-1.2492 1.34326 -3.89684 -3.4257 880.501 194.905)"
                    gradientUnits="userSpaceOnUse"
                ></radialGradient>
                <radialGradient
                    xlinkHref="#g"
                    id="r"
                    cx="109.627"
                    cy="135.862"
                    r="71.46"
                    fx="109.627"
                    fy="135.862"
                    gradientTransform="matrix(-1.93688 -1.043 1.45573 -2.55542 290.525 838.683)"
                    gradientUnits="userSpaceOnUse"
                ></radialGradient>
                <radialGradient
                    xlinkHref="#h"
                    id="j"
                    cx="154.87"
                    cy="145.969"
                    r="71.46"
                    fx="154.87"
                    fy="145.969"
                    gradientTransform="matrix(-.0814 -1.93722 2.92674 -.11625 -215.135 632.86)"
                    gradientUnits="userSpaceOnUse"
                ></radialGradient>
                <filter
                    id="q"
                    width="1.097"
                    height="1.116"
                    x="-0.048"
                    y="-0.058"
                    colorInterpolationFilters="sRGB"
                >
                    <feGaussianBlur stdDeviation="1.701"></feGaussianBlur>
                </filter>
                <filter
                    id="k"
                    width="1.033"
                    height="1.02"
                    x="-0.017"
                    y="-0.01"
                    colorInterpolationFilters="sRGB"
                >
                    <feGaussianBlur stdDeviation="0.242"></feGaussianBlur>
                </filter>
                <clipPath id="i" clipPathUnits="userSpaceOnUse">
                    <path d="M371.378 193.24H237.083v53.438h77.167c-1.241 7.563-4.026 15.003-8.105 21.786-4.674 7.773-10.451 13.69-16.373 18.196-17.74 13.498-38.42 16.258-52.783 16.258-36.283 0-67.283-23.286-79.285-54.928-.484-1.149-.805-2.335-1.197-3.507a81.1 81.1 0 0 1-4.101-25.448c0-9.226 1.569-18.057 4.43-26.398 11.285-32.897 42.985-57.467 80.179-57.467 7.481 0 14.685.884 21.517 2.648a77.67 77.67 0 0 1 33.425 18.25l40.834-39.712c-24.839-22.616-57.219-36.32-95.844-36.32-30.878 0-59.386 9.553-82.748 25.7-18.945 13.093-34.483 30.625-44.97 50.985-9.753 18.879-15.094 39.8-15.094 62.294 0 22.495 5.35 43.633 15.103 62.337v.126c10.302 19.857 25.368 36.954 43.678 49.988 15.997 11.386 44.68 26.551 84.031 26.551 22.63 0 42.687-4.051 60.375-11.644 12.76-5.478 24.065-12.622 34.301-21.804 13.525-12.132 24.117-27.139 31.347-44.404s11.097-36.79 11.097-57.957c0-9.858-.998-19.87-2.689-28.968Z"></path>
                </clipPath>
            </defs>
            <g clipPath="url(#i)" transform="matrix(.95792 0 0 .98525 -90.174 -78.856)">
                <path
                    fill="url(#j)"
                    d="M92.076 219.959c.148 22.14 6.501 44.982 16.117 63.423v.127c6.949 13.392 16.445 23.97 27.26 34.452l65.327-23.67c-12.36-6.235-14.246-10.055-23.105-17.026-9.054-9.066-15.802-19.473-20.004-31.677h-.17l.17-.127c-2.765-8.058-3.037-16.613-3.14-25.503Z"
                    filter="url(#k)"
                ></path>
                <path
                    fill="url(#l)"
                    d="M237.084 79.025c-6.457 22.526-3.989 44.421 0 57.161 7.456.006 14.638.888 21.449 2.647a77.66 77.66 0 0 1 33.424 18.25l41.88-40.726c-24.81-22.59-54.667-37.296-96.754-37.332"
                    filter="url(#k)"
                ></path>
                <path
                    fill="url(#m)"
                    d="M236.943 78.847c-31.67 0-60.91 9.798-84.871 26.359a145.5 145.5 0 0 0-24.332 21.15c-1.904 17.744 14.257 39.551 46.262 39.37 15.528-17.936 38.495-29.542 64.056-29.542l.07.002-1.044-57.335q-.07-.002-.14-.004"
                    filter="url(#k)"
                ></path>
                <path
                    fill="url(#n)"
                    d="m341.475 226.379-28.268 19.285c-1.24 7.562-4.028 15.002-8.107 21.786-4.674 7.772-10.45 13.69-16.373 18.196-17.702 13.47-38.328 16.244-52.687 16.255-14.842 25.102-17.444 37.675 1.043 57.934 22.877-.016 43.157-4.117 61.046-11.796 12.931-5.551 24.388-12.792 34.761-22.097 13.706-12.295 24.442-27.503 31.769-45s11.245-37.282 11.245-58.734Z"
                    filter="url(#k)"
                ></path>
                <path
                    fill="#3086ff"
                    d="M234.996 191.21v57.498h136.006c1.196-7.874 5.152-18.064 5.152-26.5 0-9.858-.996-21.899-2.687-30.998Z"
                    filter="url(#k)"
                ></path>
                <path
                    fill="url(#o)"
                    d="M128.39 124.327c-8.394 9.119-15.564 19.326-21.249 30.364-9.753 18.879-15.094 41.83-15.094 64.324 0 .317.026.627.029.944 4.32 8.224 59.666 6.649 62.456 0-.004-.31-.039-.613-.039-.924 0-9.226 1.57-16.026 4.43-24.367 3.53-10.289 9.056-19.763 16.123-27.926 1.602-2.031 5.875-6.397 7.121-9.016.475-.997-.862-1.557-.937-1.908-.083-.393-1.876-.077-2.277-.37-1.275-.929-3.8-1.414-5.334-1.845-3.277-.921-8.708-2.953-11.725-5.06-9.536-6.658-24.417-14.612-33.505-24.216"
                    filter="url(#k)"
                ></path>
                <path
                    fill="url(#p)"
                    d="M162.099 155.857c22.112 13.301 28.471-6.714 43.173-12.977l-25.574-52.664a144.7 144.7 0 0 0-26.543 14.504c-12.316 8.512-23.192 18.9-32.176 30.72Z"
                    filter="url(#q)"
                ></path>
                <path
                    fill="url(#r)"
                    d="M171.099 290.222c-29.683 10.641-34.33 11.023-37.062 29.29a145 145 0 0 0 16.792 13.984c15.996 11.386 46.766 26.551 86.118 26.551.046 0 .09-.004.137-.004v-59.157l-.094.002c-14.736 0-26.512-3.843-38.585-10.527-2.977-1.648-8.378 2.777-11.123.799-3.786-2.729-12.9 2.35-16.183-.938"
                    filter="url(#k)"
                ></path>
                <path
                    fill="url(#s)"
                    d="M219.7 299.023v59.996c5.506.64 11.236 1.028 17.247 1.028 6.026 0 11.855-.307 17.52-.872v-59.748a105 105 0 0 1-17.477 1.461c-5.932 0-11.7-.686-17.29-1.865"
                    filter="url(#k)"
                    opacity="0.5"
                ></path>
            </g>
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2"
            />
        </svg>
    );
}

function AppleIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 15 20"        >
            <g id="Page-1" fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
                <g
                    id="Dribbble-Light-Preview"
                    fill="#000"
                    transform="translate(-102 -7439)"
                >
                    <g id="icons" transform="translate(56 160)">
                        <path
                            id="apple-[#173]"
                            d="M57.57 7282.193c.73-.845 1.221-2.022 1.087-3.193-1.05.04-2.322.671-3.075 1.515-.677.749-1.267 1.946-1.108 3.094 1.172.087 2.368-.57 3.097-1.416m2.628 7.432c.03 3.027 2.77 4.034 2.801 4.047-.022.07-.438 1.435-1.444 2.845-.87 1.218-1.774 2.43-3.196 2.457-1.398.025-1.848-.794-3.447-.794-1.597 0-2.097.768-3.42.819-1.373.049-2.42-1.318-3.296-2.532-1.794-2.483-3.164-7.017-1.324-10.077.915-1.52 2.548-2.482 4.321-2.506 1.348-.025 2.621.869 3.445.869.825 0 2.372-1.075 3.998-.917.68.027 2.591.263 3.818 1.984-.1.059-2.28 1.275-2.256 3.805"
                        ></path>
                    </g>
                </g>
            </g>
        </svg>
    );
}

const socialProviders = [
    { key: "google", label: "Google", path: "/auth/google?prompt=select_account", icon: <GoogleIcon /> },
    { key: "facebook", label: "Facebook", path: "/auth/facebook?auth_type=reauthenticate", icon: <FacebookIcon /> },
    { key: "apple", label: "Apple", path: "/auth/apple", icon: <AppleIcon /> },
] as const;

export function AuthSocialButtons() {
    const t = useTranslations("auth");

    const handleOAuth = (path: string) => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

        if (!apiBaseUrl) {
            console.error("NEXT_PUBLIC_API_URL is not configured.");
            return;
        }

        window.location.href = `${apiBaseUrl}${path}`;
    };

    return (
        <>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">{t("continueWith")}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {socialProviders.map((provider) => (
                    <Button
                        key={provider.key}
                        variant="outline"
                        type="button"
                        onClick={() => handleOAuth(provider.path)}
                        className="w-full justify-center"
                    >
                        {provider.label}

                        {provider.icon}
                    </Button>
                ))}
            </div>
        </>
    );
}
