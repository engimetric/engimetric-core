export const ProblemStatement = () => {
    return (
        <section className="py-16 bg-muted bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400  text-white">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">
                    The Challenges of Tracking Engineering Performance
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gray-700 rounded-md">
                        <h3 className="font-semibold mb-2">Fragmented Data Across Tools</h3>
                        <p>Bring all your data together seamlessly.</p>
                    </div>
                    <div className="p-6 bg-gray-700 rounded-md">
                        <h3 className="font-semibold mb-2">Manual Reporting Overhead</h3>
                        <p>Automate repetitive reporting tasks.</p>
                    </div>
                    <div className="p-6 bg-gray-700 rounded-md">
                        <h3 className="font-semibold mb-2">Lack of Actionable Insights</h3>
                        <p>Gain clear, data-driven insights instantly.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
