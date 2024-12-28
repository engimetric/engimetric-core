import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';

export default function AboutPage() {
    return (
        <>
            <Navbar />
            {/* Hero Section */}
            <section className="@container py-20">
                <div className="container mx-auto text-center ">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 ">About Engimetric</h1>
                    <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
                        Empowering engineering teams with data-driven insights and AI-powered reporting.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="bg-gray-800 text-white py-16">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                    <p className="max-w-3xl mx-auto text-gray-300">
                        At Engimetric, our mission is to simplify engineering performance tracking through
                        seamless integrations, actionable insights, and scalable solutions. We believe that
                        data should empower, not overwhelm.
                    </p>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="bg-gray-900 text-white py-16">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gray-800 rounded-md">
                            <h3 className="font-semibold mb-2">Innovation</h3>
                            <p className="text-gray-300">We embrace technology to drive smarter solutions.</p>
                        </div>
                        <div className="p-6 bg-gray-800 rounded-md">
                            <h3 className="font-semibold mb-2">Transparency</h3>
                            <p className="text-gray-300">Open and honest communication builds trust.</p>
                        </div>
                        <div className="p-6 bg-gray-800 rounded-md">
                            <h3 className="font-semibold mb-2">Excellence</h3>
                            <p className="text-gray-300">
                                We strive to deliver top-quality results every time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="rounded-xl bg-muted bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 px-6 py-10 text-center">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Join Us on Our Journey</h2>
                    <p className="mb-6">Become a part of the future of engineering metrics today.</p>
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-md">
                        Get Started
                    </button>
                </div>
            </section>
            <Footer />
        </>
    );
}
