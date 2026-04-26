This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API Request Logging

API request logging is disabled by default in development.

- Set `NEXT_PUBLIC_ENABLE_API_REQUEST_LOGGING=1` to enable logging in the browser and on the server.
- Set `ENABLE_API_REQUEST_LOGGING=1` to enable logging for server-only flows.
- When enabled, entries are appended to a newline-delimited JSON log under the OS temp directory by default.
- Set `API_LOG_FILE_PATH` to change the log file location.
- Set `API_LOG_MAX_BYTES` to cap the log file size before it is rotated.
- Set `API_LOG_BASE_URL` if server-rendered requests cannot reach the local app with the default `http://127.0.0.1:3000` fallback.

## Sell With Us Backend

- The `app/api/sell-with-us` route now submits merchant leads to `${NEXT_PUBLIC_API_URL}/partners` by default.
- Set `SELL_WITH_US_PARTNERS_API_URL` to override the full Partner create endpoint when needed.
- Because the Partner create endpoint is admin-guarded, set `SELL_WITH_US_PARTNERS_API_TOKEN` on the Next.js server for public submissions, or rely on a forwarded authenticated admin session.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
