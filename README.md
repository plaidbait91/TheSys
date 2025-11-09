This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The journal is stored in `sessionStorage`; close the tab to reset its contents.

I've used Anthropic as the provider for this project since I happened to have credits for it beforehand. To run the project with openAI, install the corresponding package and make changes in the [API route](app/api/chat/route.ts).

```bash
npm i @ai-sdk/openai
```
