/**
 * Sample initial cards data
 */

import type { Card } from '../types';

export const initialCards: Card[] = [
    {
        id: 1,
        title: "React Documentation",
        content: "Comprehensive guide to React.js with hooks and components",
        link: "https://react.dev",
        coverUrl: "https://react.dev/images/home/conf2021/cover.svg",
        tags: ["React", "JavaScript", "Frontend"],
        createdAt: new Date("2025-10-20T10:30:00Z"),
        updatedAt: new Date("2025-10-20T10:30:00Z")
    },
    {
        id: 2,
        title: "TailwindCSS Components",
        content: "Beautiful UI components built with Tailwind CSS",
        link: "https://tailwindui.com",
        tags: ["TailwindCSS", "UI", "Design"],
        createdAt: new Date("2025-10-20T09:15:00Z"),
        updatedAt: new Date("2025-10-20T09:15:00Z")
    },
    {
        id: 3,
        title: "Project Architecture",
        content: "System design diagram for the new microservices architecture",
        coverUrl: "https://example.com/images/architecture.png",
        tags: ["Architecture", "Design", "Planning"],
        createdAt: new Date("2025-10-19T16:45:00Z"),
        updatedAt: new Date("2025-10-19T16:45:00Z")
    },
    {
        id: 4,
        title: "Material Design Guidelines",
        content: "Google's design system principles and best practices",
        link: "https://m3.material.io",
        tags: ["Design", "UI/UX", "Guidelines"],
        createdAt: new Date("2025-10-19T14:20:00Z"),
        updatedAt: new Date("2025-10-19T14:20:00Z")
    },
    {
        id: 5,
        title: "API Documentation Mockup",
        content: "Visual mockup for the REST API documentation layout",
        coverUrl: "https://example.com/images/api-mockup.jpg",
        tags: ["API", "Documentation", "Mockup"],
        createdAt: new Date("2025-10-18T11:30:00Z"),
        updatedAt: new Date("2025-10-18T11:30:00Z")
    },
    {
        id: 6,
        title: "GitHub Repository",
        content: "Main project repository with all source code",
        link: "https://github.com/example/project",
        tags: ["GitHub", "Code", "Repository"],
        createdAt: new Date("2025-10-18T08:45:00Z"),
        updatedAt: new Date("2025-10-18T08:45:00Z")
    },
    {
        id: 7,
        title: "Design System Colors",
        content: "Color palette and scheme for the project branding",
        coverUrl: "https://example.com/images/colors.png",
        tags: ["Design", "Colors", "Branding"],
        createdAt: new Date("2025-10-17T15:20:00Z"),
        updatedAt: new Date("2025-10-17T15:20:00Z")
    },
    {
        id: 8,
        title: "Stack Overflow Solution",
        content: "Clever solution for handling async state in React",
        link: "https://stackoverflow.com/questions/example",
        tags: ["React", "JavaScript", "Problem-solving"],
        createdAt: new Date("2025-10-17T13:10:00Z"),
        updatedAt: new Date("2025-10-17T13:10:00Z")
    },
    {
        id: 9,
        title: "User Journey Map",
        content: "Complete user experience flow from onboarding to conversion",
        coverUrl: "https://example.com/images/user-journey.svg",
        tags: ["UX", "User Research", "Journey"],
        createdAt: new Date("2025-10-16T09:30:00Z"),
        updatedAt: new Date("2025-10-16T09:30:00Z")
    },
    {
        id: 10,
        title: "Performance Optimization",
        content: "Web vitals and performance metrics optimization techniques",
        link: "https://web.dev/performance",
        tags: ["Performance", "Web Vitals", "Optimization"],
        createdAt: new Date("2025-10-16T07:45:00Z"),
        updatedAt: new Date("2025-10-16T07:45:00Z")
    }
];