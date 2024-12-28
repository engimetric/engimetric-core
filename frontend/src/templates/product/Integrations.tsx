import Image from 'next/image';

export const Integrations = () => {
    const integrations = [
        { name: 'GitHub', logo: '/logos/github.svg' },
        { name: 'Jira', logo: '/logos/jira.svg' },
        { name: 'Zoom', logo: '/logos/zoom.svg' },
        { name: 'Slack', logo: '/logos/slack.svg' },
    ];

    return (
        <section className="py-16 @containers text-white">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">Integrate with Your Favorite Tools</h2>
                <p className="mb-8">Centralize your data from tools you already use every day.</p>
                <div className="flex flex-wrap justify-center gap-8">
                    {integrations.map((integration) => (
                        <div key={integration.name} className="p-4 bg-gray-800 rounded-md flex items-center">
                            <Image
                                src={integration.logo}
                                alt={integration.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 object-contain"
                            />
                            <p className="ml-4 font-semibold">{integration.name}</p>
                        </div>
                    ))}
                </div>
                <button className="mt-8 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-md">
                    View All Integrations
                </button>
            </div>
        </section>
    );
};
