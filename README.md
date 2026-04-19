# SkySpot

[Presentation](https://docs.google.com/presentation/d/1KBcXDkRX9n1WFCCT2weEhRVF5AIkkN0RM32ia9UzFdY/edit?usp=sharing)

## Motivation

**SkySpot** was created at <a href="https://hacknarok.pl/" target="_blank">Hacknarök</a> 2026 Hackathon

- Topic: Dekada innowacji: zbuduj fundamenty nowej ery w otaczającej nas rzeczywistości
- Timeframe: 18-19.04.2026, 24 hours

## Installation

Install dependencies

```
pnpm i
```

Create example `.env` file

```
pnpm env:init
```

Create database and seed data

```
pnpm db:reset
```

Start server

```
pnpm dev
```

Website will be available at [localhost:3000](http://localhost:3000). The website is designed for mobile view, so open it in your browser's mobile mode.

To make drones move, you can additionally start another script simulating external drone provider system

```
pnpm sim
```

The external API enables real-time drone tracking and updates, order processing, landing pad reservations and more

## Tech Stack

<img alt="NEXT.JS" src="https://img.shields.io/badge/Next.js-000000.svg?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
<img alt="REACTJS" src="https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=React&logoColor=black"/>
<img alt="TYPESCRIPT" src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white"/>
<img alt="TAILWIND" src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4.svg?style=for-the-badge&logo=Tailwind-CSS&logoColor=white"/>
<img alt="SHADCN" src="https://img.shields.io/badge/shadcn/ui-000000.svg?style=for-the-badge&logo=shadcn/ui&logoColor=white"/>
<img alt="SQLITE" src="https://img.shields.io/badge/sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white"/>
<img alt="PRISMA" src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white"/>
<img alt="TRPC" src="https://img.shields.io/badge/tRPC-2596BE?style=for-the-badge&logo=trpc&logoColor=white"/>

## Authors

- [@MBrosik](https://github.com/MBrosik)
- [@xWikuss](https://github.com/xWikuss)
- [@rubikon02](https://github.com/rubikon02)
