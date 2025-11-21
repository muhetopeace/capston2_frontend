export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About publisher-platform</h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Publisher's-platform is a modern publishing platform that empowers writers to share their stories,
            ideas, and expertise with the world. Built with Next.js and React, we provide a seamless
            writing and reading experience.
          </p>

          {/* OUR MISSION */}
          <div className="mt-8 p-6 shadow-md rounded-lg bg-white">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p>
              Our mission is to create a platform where anyone can share their knowledge and stories,
              fostering a community of learning and creativity. We believe that great ideas deserve to
              be shared, and great writers deserve a platform that makes publishing effortless.
            </p>
          </div>

          {/* FEATURES */}
          <div className="mt-8 p-6 shadow-md rounded-lg bg-white">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Rich text editor for creating beautiful content</li>
              <li>Tag-based organization for easy discovery</li>
              <li>Social features including likes and comments</li>
              <li>User profiles and following system</li>
              <li>Search functionality to find content</li>
              <li>Draft saving and publishing workflow</li>
            </ul>
          </div>

          {/* TECHNOLOGY */}
          <div className="mt-8 p-6 shadow-md rounded-lg bg-white">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology</h2>
            <p>
              This platform is built using cutting-edge web technologies including Next.js 16, React 19,
              TypeScript, Prisma ORM, PostgreSQL, and Tailwind CSS. We prioritize performance,
              accessibility, and user experience in everything we build.
            </p>
          </div>

          {/* GET STARTED */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h2>
            <p className="mb-4">
              Ready to start sharing your stories? Create an account and begin writing today!
            </p>
            <a
              href="/auth/signup"
              className="inline-block rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Join Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


