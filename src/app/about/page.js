// app/about/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import Header from '../component/Header';
import Footer from '../component/Footer';

export default function AboutPage() {
  return (
    <main className="bg-white">
      <Header />
      {/* Hero Section – same as HeroBg but with vehicle-rental text */}
      <div className="relative">
        <img
          src="/about.png"          // Replace with a hero image showing EVs / nature
          alt="Electric vehicle rental"
          className="h-150 w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <h1 className="absolute top-1/2 ml-10 -translate-y-40 text-7xl font-bold text-white">
          Ride Green. <br />
          <span className="text-green-200">Explore Green.</span>
        </h1>

        <p className="absolute top-1/2 ml-11 text-white">
          Rent electric vehicles for eco‑friendly exploration. <br />
          Cars, bikes, scooters & cycles — all at your fingertips with smart maps and local recommendations.
        </p>

        <div className="absolute top-1/2 flex translate-x-10 translate-y-30 gap-2 text-white">
          <Link
            href="/vehicles"
            className="rounded-lg border-none bg-green-700 px-5 py-3"
          >
            Rent Now
          </Link>
          <Link
            href="/map"
            className="rounded-lg border-none bg-gray-400/30 px-5 py-3 text-white backdrop-blur-sm"
          >
            Explore Map
          </Link>
        </div>
      </div>

      {/* "Choose Your Ride" section – original from your HeroBg */}
      <div className="mt-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900">Choose Your Ride</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
          From zippy scooters to comfortable cars — find the perfect electric vehicle for every journey.
        </p>
      </div>

      {/* Features – now focused on EV rental benefits */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-green-600">Why Mobily Hub?</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Smart, green & hassle‑free
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                Eco‑friendly fleet
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">100% electric vehicles – reduce your carbon footprint while exploring.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                Smart maps & live availability
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Find and unlock nearby vehicles instantly with our app & web platform.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
                  </svg>
                </div>
                Community driven
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Join thousands of riders who choose green mobility every day.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Mission & Vision – tailored for EV rental */}
      <div className="bg-green-50/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-green-600">Our mission</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Make every trip emission‑free
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  We provide convenient, affordable access to electric vehicles — empowering you to explore cities and nature without harming the planet.
                </p>
              </div>
            </div>
            <div className="lg:pl-8">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-green-600">Our vision</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  A cleaner, connected future
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  To build the largest smart EV sharing network, where sustainable transport is the first choice for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core values – unchanged but context now fits */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-green-600">Our core values</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What drives us every day
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-900/5">
                  <h3 className="text-xl font-semibold leading-7 text-gray-900">Sustainability</h3>
                  <p className="mt-4 text-base leading-7 text-gray-600">Every ride reduces emissions. We’re committed to carbon‑neutral operations.</p>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-900/5">
                  <h3 className="text-xl font-semibold leading-7 text-gray-900">Innovation</h3>
                  <p className="mt-4 text-base leading-7 text-gray-600">Smart locks, real‑time tracking, and seamless payments – built for you.</p>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-gray-900/5">
                  <h3 className="text-xl font-semibold leading-7 text-gray-900">Community first</h3>
                  <p className="mt-4 text-base leading-7 text-gray-600">We listen, adapt, and grow with our riders. Your feedback shapes our service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team section – same but bio updated for vehicle rental context */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-green-600">The people behind Mobily Hub</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Meet the team driving change
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex flex-col items-start">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-gray-100">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-8 text-gray-900">{member.name}</h3>
                <p className="text-base leading-7 text-green-600">{member.role}</p>
                <p className="mt-2 text-base leading-7 text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA – focused on renting EVs */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to ride green?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Download the app or browse our fleet — unlock an electric vehicle near you in minutes.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/vehicles"
                className="rounded-md bg-green-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600"
              >
                Find a vehicle
              </Link>
              <Link
                href="/contact"
                className="rounded-md bg-gray-400/30 px-3.5 py-2.5 text-sm font-semibold text-gray-900 backdrop-blur-sm hover:bg-gray-400/40"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

const teamMembers = [
  {
    name: 'Alex Chen',
    role: 'Founder & CEO',
    bio: 'Former urban mobility expert. Passionate about making green transport accessible to all.',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Sarah Johnson',
    role: 'Head of Fleet',
    bio: 'Loves optimising EV availability and ensuring every vehicle is ready to ride.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Customer Experience Lead',
    bio: 'Ensures every rider gets a smooth, joyful experience from booking to return.',
    imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];