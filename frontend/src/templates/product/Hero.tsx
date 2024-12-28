export const Hero = () => {
    return (
        <section className="@container py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    Empower Your Engineering Teams with AI-Driven Insights
                </h1>
                <p className="text-lg md:text-xl mb-8">
                    One platform to unify your team metrics, automate reporting, and surface meaningful
                    insights from your data.
                </p>
                <div className="space-x-4">
                    <button className="bg-muted bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white px-6 py-3 rounded-md">
                        Get Started Free
                    </button>
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-md">
                        Explore Documentation
                    </button>
                </div>
            </div>
        </section>
    );
};
