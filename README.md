# Waie

**Waie** is a modern Arabic content platform built around thoughtful Islamic and life-oriented content, designed to make meaningful knowledge easier to discover, explore, and revisit.

The platform brings together episodes, series, hosts, transcripts, recommendations, and visual learning experiences in a polished, content-first interface.

## ✨ Overview

Waie is designed around a simple idea:

> **Make meaningful content easier to discover, understand, and return to.**

The experience focuses on:

* Arabic-first, RTL design
* Content discovery through curated series and episodes
* Rich episode pages with transcripts and recommendations
* Visual storytelling and smooth interactions
* Responsive, app-like experience across devices
* A clean and immersive interface without unnecessary complexity

## 🚀 Features

### Home

A content-focused homepage featuring highlighted episodes, series, hosts, and curated content.

### Series

Browse content organized into meaningful series and themes.

### Library

A central place to explore and revisit available content.

### Hosts

Discover the people behind the content and explore their episodes.

### Episode Experience

Each episode can include:

* Episode information
* Video/audio content
* Transcript
* Related recommendations
* Mind-map / visual learning experience
* Related episodes and series

### Admin Dashboard

A protected administration area for managing the platform's content.

The dashboard is accessible only to authenticated users with the appropriate admin permissions.

### Arabic & RTL

The platform is designed primarily for Arabic content with proper RTL layouts and typography.

### Responsive Design

The interface is optimized for:

* Mobile
* Tablet
* Desktop

with an app-like experience on smaller screens.

## 🛠️ Tech Stack

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Framer Motion**
* **Lucide React**
* **Next.js App Router**
* **RTL / Arabic-first UI**

Additional libraries and services may be used throughout the project for content management, authentication, media, and data fetching.

## 📁 Project Structure

The project follows a feature-oriented Next.js structure.

```text
waie/
├── app/
│   ├── (public)/
│   ├── admin/
│   ├── series/
│   ├── library/
│   ├── hosts/
│   └── ...
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── home/
│   ├── episodes/
│   ├── series/
│   └── ...
│
├── lib/
│   ├── api/
│   ├── utils/
│   └── ...
│
├── public/
│   ├── images/
│   ├── icons/
│   └── ...
│
└── ...
```

> The exact structure may evolve as the project grows.

## ⚙️ Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm / pnpm / yarn
* Git

installed on your machine.

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd waie
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Then configure the required environment variables.

Do **not** commit secrets or private environment variables to the repository.

### Development

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🏗️ Production Build

Create a production build:

```bash
npm run build
```

Run the production server:

```bash
npm start
```

## 🔐 Authentication & Admin Access

The admin area is protected and is not publicly accessible.

Users must:

1. Have an account
2. Log in successfully
3. Have the required admin role/permission

Unauthenticated users attempting to access protected admin routes should be redirected to the login page.

Authenticated users without admin permissions should not be able to access admin functionality.

Authorization should be enforced server-side rather than relying only on frontend UI restrictions.

## 🎨 Design Philosophy

Waie intentionally avoids the look of a traditional institutional or governmental website.

The design direction focuses on:

* Editorial storytelling
* Visual hierarchy
* Arabic typography
* Generous spacing
* Subtle glassmorphism
* Smooth motion
* Immersive hero sections
* Content-first layouts
* Mobile-first interaction patterns

The goal is to make the platform feel closer to a **modern media/product experience** than a conventional content website.

## 🧭 Main Navigation

The primary navigation is centered around:

* **Home**
* **Series**
* **Library**
* **Hosts**

The navigation is intentionally kept focused to avoid duplicating concepts or overwhelming the user.

## 📚 Content Model

The platform revolves around several core content concepts:

```text
Host
  ↓
Series
  ↓
Episodes
  ↓
Transcript
  ↓
Related Content
```

This structure allows users to discover content through different paths instead of relying solely on a chronological feed.

## 🧩 Development Principles

When contributing to Waie, prioritize:

### Performance

Avoid unnecessary client-side JavaScript and expensive rendering where possible.

### Accessibility

Use semantic HTML, accessible controls, meaningful labels, and proper keyboard interactions.

### Responsiveness

Every major feature should work naturally across mobile, tablet, and desktop.

### Reusability

Prefer reusable components over duplicated UI implementations.

### Maintainability

Keep business logic separate from presentation where appropriate and avoid unnecessary complexity.

### Content First

UI decisions should support the content rather than compete with it.

## 🌐 Deployment

The project can be deployed to platforms supporting Next.js, such as Vercel.

Before deploying, make sure all required environment variables are configured in the deployment environment.

## 📝 License

This project is proprietary unless otherwise specified.

All rights reserved.

---

## Made for meaningful content

**Waie** is built to help people discover, explore, and return to content that matters.
