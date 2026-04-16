import type { BearData } from "~/types";

const bear: BearData[] = [
  {
    id: "profile",
    title: "Profile",
    icon: "i-fa-solid:paw",
    md: [
      {
        id: "about-me",
        title: "About Me",
        file: "markdown/about-me.md",
        icon: "i-la:dragon",
        excerpt: "Hey there! I'm a Omkar Shirvalkar lost in human world..."
      },
      {
        id: "github-stats",
        title: "Github Stats",
        file: "markdown/github-stats.md",
        icon: "i-icon-park-outline:github",
        excerpt: "Here are some status about my github account..."
      },
      {
        id: "about-site",
        title: "About This Site",
        file: "markdown/about-site.md",
        icon: "i-octicon:browser",
        excerpt: "Something about this personal portfolio site..."
      }
    ]
  },
  {
    id: "project",
    title: "Projects",
    icon: "i-octicon:repo",
    md: [
      {
        id: "bcx",
        title: "BCX",
        file: "markdown/bcx.md",
        icon: "i-tabler:leaf",
        excerpt: "Carbon credit trading platform built for India's green economy...",
        link: "https://github.com/omkar-sip/bcx"
      },
      {
        id: "agrithon-git",
        title: "KisanSaathi",
        file: "https://raw.githubusercontent.com/omkar-sip/agrithon-git/main/README.md",
        icon: "i-tabler:plant-2",
        excerpt: "AI-powered agri assistant – Sarpanch AI for Indian farmers...",
        link: "https://github.com/omkar-sip/agrithon-git"
      },
      {
        id: "hils",
        title: "HILS",
        file: "https://raw.githubusercontent.com/omkar-sip/HILS/main/README.md",
        icon: "i-tabler:school",
        excerpt: "AI-powered, VTU-aligned learning platform for engineering students...",
        link: "https://github.com/omkar-sip/HILS"
      },
      {
        id: "mockify-ai",
        title: "Mockify AI",
        file: "https://raw.githubusercontent.com/omkar-sip/mockify-ai/main/README.md",
        icon: "i-tabler:microphone",
        excerpt: "Advanced mock interview platform with AI-driven feedback...",
        link: "https://github.com/omkar-sip/mockify-ai"
      },
      {
        id: "homiesearch",
        title: "HomieSearch",
        file: "markdown/homiesearch.md",
        icon: "i-tabler:home-search",
        excerpt: "Smart rental and PG discovery platform for students and professionals...",
        link: "https://github.com/omkar-sip/homiesearch"
      },
      {
        id: "infrasync",
        title: "InfraSync",
        file: "markdown/infrasync.md",
        icon: "i-tabler:building-skyscraper",
        excerpt: "Digital management system for public infrastructure projects...",
        link: "https://github.com/omkar-sip/infrasync"
      },
      {
        id: "munim-ai",
        title: "Munim AI",
        file: "https://raw.githubusercontent.com/omkar-sip/munim-ai/main/README.md",
        icon: "i-tabler:calculator",
        excerpt: "Intelligent accounting and financial assistant powered by AI...",
        link: "https://github.com/omkar-sip/munim-ai"
      },
      {
        id: "vaani-ai",
        title: "Vaani AI",
        file: "markdown/vaani-ai.md",
        icon: "i-tabler:volume",
        excerpt: "Voice-powered AI assistant for seamless multilingual conversations...",
        link: "https://github.com/omkar-sip/vaani-ai"
      },
      {
        id: "ghost-protocol",
        title: "Ghost Protocol",
        file: "https://raw.githubusercontent.com/omkar-sip/ghost-protocol/main/README.md",
        icon: "i-tabler:ghost",
        excerpt: "Stealth-mode TypeScript project for secure operations...",
        link: "https://github.com/omkar-sip/ghost-protocol"
      },
      {
        id: "robusco",
        title: "Robusco",
        file: "markdown/robusco.md",
        icon: "i-tabler:robot",
        excerpt: "Creative web project pushing the boundaries of interactive UI...",
        link: "https://github.com/omkar-sip/robusco"
      },
      {
        id: "vsm-nipani",
        title: "VSM Nipani",
        file: "https://raw.githubusercontent.com/omkar-sip/vsm-nipani/main/README.md",
        icon: "i-tabler:map-pin",
        excerpt: "Official digital web presence for VSM Nipani institution...",
        link: "https://github.com/omkar-sip/vsm-nipani"
      },
      {
        id: "vrnn-website",
        title: "VRNN",
        file: "markdown/vrnn-website.md",
        icon: "i-tabler:world",
        excerpt: "Official VRNN website – connecting students, innovators and creators...",
        link: "https://github.com/omkar-sip/VRNN-Website"
      }
    ]
  }
];

export default bear;
