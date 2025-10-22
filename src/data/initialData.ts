/**
 * Sample initial cards data
 */

import type { Card } from '../types';

export const initialCards: Card[] = [
    {
        id: 1,
        title: "React Documentation",
        description: "Comprehensive guide to React.js with hooks and components",
        url: "https://react.dev",
        type: "link",
        tags: ["React", "JavaScript", "Frontend"],
        favicon: "https://react.dev/favicon.ico",
        created_at: "2025-10-20T10:30:00Z"
    },
    {
        id: 2,
        title: "TailwindCSS Components",
        description: "Beautiful UI components built with Tailwind CSS",
        url: "https://tailwindui.com",
        type: "link",
        tags: ["TailwindCSS", "UI", "Design"],
        favicon: "https://tailwindui.com/favicon.ico",
        created_at: "2025-10-20T09:15:00Z"
    },
    {
        id: 3,
        title: "Project Architecture",
        description: "System design diagram for the new microservices architecture",
        url: "https://example.com/images/architecture.png",
        type: "image",
        tags: ["Architecture", "Design", "Planning"],
        created_at: "2025-10-19T16:45:00Z"
    },
    {
        id: 4,
        title: "Material Design Guidelines",
        description: "Google's design system principles and best practices",
        url: "https://m3.material.io",
        type: "link",
        tags: ["Design", "UI/UX", "Guidelines"],
        favicon: "https://m3.material.io/favicon.ico",
        created_at: "2025-10-19T14:20:00Z"
    },
    {
        id: 5,
        title: "API Documentation Mockup",
        description: "Visual mockup for the REST API documentation layout",
        url: "https://example.com/images/api-mockup.jpg",
        type: "image",
        tags: ["API", "Documentation", "Mockup"],
        created_at: "2025-10-18T11:30:00Z"
    },
    {
        id: 6,
        title: "GitHub Repository",
        description: "Main project repository with all source code",
        url: "https://github.com/example/project",
        type: "link",
        tags: ["GitHub", "Code", "Repository"],
        favicon: "https://github.com/favicon.ico",
        created_at: "2025-10-18T08:45:00Z"
    },
    {
        id: 7,
        title: "Design System Colors",
        description: "Color palette and scheme for the project branding",
        url: "https://example.com/images/colors.png",
        type: "image",
        tags: ["Design", "Colors", "Branding"],
        created_at: "2025-10-17T15:20:00Z"
    },
    {
        id: 8,
        title: "Stack Overflow Solution",
        description: "Clever solution for handling async state in React",
        url: "https://stackoverflow.com/questions/example",
        type: "link",
        tags: ["React", "JavaScript", "Problem-solving"],
        favicon: "https://stackoverflow.com/favicon.ico",
        created_at: "2025-10-17T13:10:00Z"
    },
    {
        id: 9,
        title: "User Journey Map",
        description: "Complete user experience flow from onboarding to conversion",
        url: "https://example.com/images/user-journey.svg",
        type: "image",
        tags: ["UX", "User Research", "Journey"],
        created_at: "2025-10-16T09:30:00Z"
    },
    {
        id: 10,
        title: "Performance Optimization",
        description: "Web vitals and performance metrics optimization techniques",
        url: "https://web.dev/performance",
        type: "link",
        tags: ["Performance", "Web Vitals", "Optimization"],
        favicon: "https://web.dev/favicon.ico",
        created_at: "2025-10-16T07:45:00Z"
    }
];