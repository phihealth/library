// Dependencies - Project
import { StructureSettingsInterface } from './libraries/structure/StructureSettings';

// ProjectSettings
export const ProjectSettings: StructureSettingsInterface = {
    identifier: 'system',
    title: 'Structure',
    ownerDisplayName: 'System, Inc.',
    tagline: 'React and Next.js Implementation for Base',
    description: 'A React and Next.js implementation for Base.',
    url: 'https://www.system.inc/',
    apis: {
        base: {
            url: 'https://api.system.inc/graphql', // This needs to be an absolute url, as relative urls cannot be used in SSR
        },
    },
    modules: {
        accounts: true,
        engagement: true,
        support: true,
        posts: true,
        commerce: true,
    },
    theme: {
        defaultClassName: 'light',
    },
    assets: {
        url: 'https://assets.system.inc/',
        favicon: {
            light: {
                location: '/images/icons/favicons/favicon-light.png',
            },
            dark: {
                location: '/images/icons/favicons/favicon-dark.png',
            },
        },
        logo: {
            light: {
                location: '/images/logos/logo-light.png',
            },
            dark: {
                location: '/images/logos/logo-dark.png',
            },
            width: 102,
            height: 37,
        },
    },
    sourceCodeRepositories: {
        structure: {
            url: 'https://github.com/system-inc/structure-next/',
        },
        project: {
            url: 'https://github.com/system-inc/structure-next-template/',
        },
    },
    services: {
        google: {
            analytics: {
                id: '',
            },
        },
    },
    platforms: {
        x: {
            title: 'X',
            url: 'https://x.com/systeminc',
            type: 'social',
        },
        instagram: {
            title: 'Instagram',
            url: 'https://www.instagram.com/systeminc',
            type: 'social',
        },
    },
};

// Export - Default
export default ProjectSettings;
