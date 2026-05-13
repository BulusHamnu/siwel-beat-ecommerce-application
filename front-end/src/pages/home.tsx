import Header from "../components/header";
import { Search, Check, ArrowUpRight } from "lucide-react";
import TrackCard from "../components/trackCard";
import Button from "../components/button";
import { Link } from "react-router-dom";

function LicenseItem({ term }: { term: string }) {
  return (
    <p className="flex flex-row flex-wrap items-center gap-1.5 text-sm mb-1">
      <Check size={20} /> {term}
    </p>
  );
}

/* Home page */
function Home() {
  return (
    <>
      <Header />
      <main className="">
        <h1>Siwel Beats App</h1>
        <div className="bg-white flex flex-row flex-nowrap items-center m-4 max-w-3xl md:mx-auto">
          <input
            placeholder="Find the best beat for your song.."
            className="border border-white min-h-full w-full p-2 focus:outline-none"
            type="text"
          />
          <button className="cursor-pointer p-2 bg-[#03346E] m-0.5 h-12 w-16 flex flex-row items-center justify-center rounded">
            <Search size={25} color="white" />
          </button>
        </div>
        <p className="text-md md:text-lg">
          Find the right beat to make your next hit.
        </p>
        <section
          id="lastest-tracks"
          className="lastest-tracks mt-14 mb-14 md:mt-20 bg-[rgba(110,172,218,0.05)] text-white p-5 lg:px-10"
        >
          <h2 className="text-left pl-4 md:pl-14">
            Latest Tracks From Siwel Beatz
          </h2>
          <div className="grid grid-cols-1 min-[599px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-5 mb-5 md:mt-8 gap-4 place-items-center">
            <TrackCard />
            <TrackCard />
            <TrackCard />
            <TrackCard />
          </div>
          <Button className="my-3 text-xl w-44" text="Browse more tracks" />
        </section>
        <section className="licences-terms my-24 lg:my-28">
          <h2 style={{ fontSize: "2.3rem" }} className="">
            Licensing Terms
          </h2>
          <div className=" flex flex-row flex-wrap gap-4 py-7 px-5 md:px-10 lg:px-24 items-center justify-center lg:justify-start">
            <div className="border border-white p-3 rounded-md w-full max-w-100 text-left h-full">
              <h3 className="license-heading relative pb-2 mb-5">
                🎯 Basic License (Non-Exclusive)
              </h3>
              <LicenseItem term="MP3 File" />
              <LicenseItem term="Limited Streaming (Up to XX,000 Streams)" />
              <LicenseItem term="Limited Distribution (Up to XX,000 Copies)" />
              <LicenseItem
                term="Use for Music Videos, Social Media, and
                Performances"
              />
              <LicenseItem term="Not Eligible for TV/Radio Play" />
              <LicenseItem
                term="No Exclusive Rights (Beat Can Be Sold to
                Others)"
              />
            </div>
            <div className="border border-white p-3 rounded-md w-full max-w-100 text-left h-full">
              <h3 className="license-heading relative pb-2 mb-5">
                🚀 Premium License (Exclusive)
              </h3>
              <LicenseItem term="MP3 (For now)" />
              <LicenseItem term="Unlimited Streams & Sales" />
              <LicenseItem term="Full Commercial & Monetization Rights" />
              <LicenseItem term="TV/Radio Play Allowed" />
              <LicenseItem
                term="Beat Removed from Listings (No Other Artist
                Can Buy)"
              />
              <LicenseItem term="Full Ownership & Customization" />
            </div>
          </div>
        </section>
        <section id="services" className="services my-24 lg:my-28">
          <h2 style={{ fontSize: "2.3rem" }} className="">
            My Services
          </h2>
          <div className=" flex flex-row flex-wrap gap-6 py-7 px-5 md:px-10 lg:px-24 items-center justify-center md:justify-start lg:justify-center">
            <div className="bg-white rounded-md w-full max-w-80 text-left h-full p-0.5">
              <div className="cover-image w-full max-h-80 overflow-hidden relative rounded-md">
                <img
                  className="w-full h-full object-cover object-center"
                  src="/custom-beat.png"
                  alt="Custom Beat Production"
                />
              </div>
              <div className="p-3">
                <p
                  style={{ color: "black", marginBottom: "0.6rem" }}
                  className="text-lg lg:text-xl"
                >
                  🎵 Custom Beat Production
                </p>
                <p
                  style={{ color: "black", marginBottom: "0.9rem" }}
                  className="text-sm lg:text-md"
                >
                  I’ll craft high-quality, industry-standard beats tailored to
                  your unique style. Whether you need hard-hitting trap, smooth
                  R&B, or a unique blend, I’ve got you covered.
                </p>
                <Link
                  to="#"
                  className="flex flex-row flex-nowrap gap-1 items-center justify-end text-blue-700 text-right"
                >
                  Learn More <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-md w-full max-w-80 text-left h-full p-0.5">
              <div className="cover-image w-full max-h-80 overflow-hidden relative rounded-md">
                <img
                  className="w-full h-full object-cover object-center"
                  src="/mixing-mastering.png"
                  alt="Mixing & Mastering"
                />
              </div>
              <div className="p-3">
                <p
                  style={{ color: "black", marginBottom: "0.6rem" }}
                  className="text-lg lg:text-xl"
                >
                  🎚️ Mixing & Mastering
                </p>
                <p
                  style={{ color: "black", marginBottom: "0.9rem" }}
                  className="text-sm lg:text-md"
                >
                  I’ll craft high-quality, industry-standard beats tailored to
                  your unique style. Whether you need hard-hitting trap, smooth
                  R&B, or a unique blend, I’ve got you covered.
                </p>
                <Link
                  to="#"
                  className="flex flex-row flex-nowrap gap-1 items-center justify-end text-blue-700 text-right"
                >
                  Learn More <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-md w-full max-w-80 text-left h-full p-0.5">
              <div className="cover-image w-full max-h-80 overflow-hidden relative rounded-md">
                <img
                  className="w-full h-full object-cover object-center"
                  src="/sound-design.png"
                  alt="Sound Design"
                />
              </div>
              <div className="p-3">
                <p
                  style={{ color: "black", marginBottom: "0.6rem" }}
                  className="text-lg lg:text-xl"
                >
                  🎛️ Sound Design
                </p>
                <p
                  style={{ color: "black", marginBottom: "0.9rem" }}
                  className="text-sm lg:text-md"
                >
                  I’ll craft high-quality, industry-standard beats tailored to
                  your unique style. Whether you need hard-hitting trap, smooth
                  R&B, or a unique blend, I’ve got you covered.
                </p>
                <Link
                  to="#"
                  className="flex flex-row flex-nowrap gap-1 items-center justify-end text-blue-700 text-right"
                >
                  Learn More <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
