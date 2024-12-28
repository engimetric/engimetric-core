export const Demo = () => {
    return (
        <section className="py-16 @container">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">See Engimetric in Action</h2>
                <p className="mb-8">
                    Explore our intuitive dashboard and see how it can streamline your engineering workflows.
                </p>
                <div className="relative w-full max-w-4xl mx-auto h-96 bg-gray-800 rounded-md overflow-hidden">
                    {/* Replace with an actual video or animated dashboard */}
                    <iframe
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Product Demo"
                        className="w-full h-full"
                        allowFullScreen
                    ></iframe>
                </div>
                <button className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-md">
                    Try the Demo
                </button>
            </div>
        </section>
    );
};
