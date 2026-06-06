import Header from "../components/header";
import { Search, Check, ArrowUpRight } from "lucide-react";
import TrackCard, { type Track } from "../components/trackCard";
import Button from "../components/button";
import { Link } from "react-router-dom";
import Footer from "../components/footer";
import SocialLinks from "../components/socialLinks";
import useForm from "../hooks/useForm";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import callApi from "../lib/callApi";

function LicenseItem({ term }: { term: string }) {
  return (
    <p
      style={{ marginBottom: "0.3rem" }}
      className="flex flex-row flex-wrap items-center gap-1.5 text-sm"
    >
      <Check size={20} /> {term}
    </p>
  );
}

function ContactSection() {
  const { submiting, sendMessage, errCode, status } = useForm();
  const formRef = useRef<HTMLFormElement | null>(null);

  async function handleFormSubmission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    await sendMessage(data);
  }

  useEffect(() => {
    if (status === "success") {
      toast.success("Sent! Appreciate you reaching out, gang.", {
        duration: 3000,
        id: "message-sent",
        position: "top-center",
      });
      formRef.current?.reset();
      //
    } else if (status === "failed") {
      switch (errCode) {
        case "VALIDATION_ERROR": {
          toast.error(
            "Yo, message couldn't be sent. Make sure all fields are filled and valid.",
            {
              duration: 3000,
              id: "message-failed",
              position: "top-center",
            },
          );

          break;
        }

        case "RATE_LIMIT_EXCEEDED": {
          toast.error("Too many attempts. Please try again in a few minutes.", {
            duration: 3000,
            id: "too-many-request",
            position: "bottom-right",
          });

          break;
        }

        default: {
          toast.error("Something went wrong. Please try again in a moment.", {
            duration: 3000,
            id: "message-failed",
            position: "top-center",
          });

          break;
        }
      }
    }
  }, [status, errCode]);

  return (
    <section
      id="contact"
      className="grid grid-cols-1 md:grid-cols-2 place-items-center gap-10 p-4 md:p-7 mb-20"
    >
      <div className="w-full text-left place-self-start">
        <p style={{ fontSize: "50px", marginBottom: "0.5rem" }}>Get In Touch</p>
        <p style={{ marginBottom: "1rem" }}>
          If you have any inquire or any project for me to work on just drop me
          a message
        </p>
        <p style={{ fontSize: "20px", marginBottom: "1rem" }}>
          Follow My Social
        </p>
        <SocialLinks />
        <p style={{ marginBottom: "0.5rem" }} className="whitespace-nowrap">
          Also message me if you want to play chess :)
        </p>
      </div>
      <form
        ref={formRef}
        onSubmit={(e) => handleFormSubmission(e)}
        action="POST"
        className="text-white flex flex-col flex-nowrap text-left gap-5 w-full"
      >
        <div className="form-group flex flex-col flex-nowrap gap-2">
          <label htmlFor="name" className="text-lg">
            Name
          </label>
          <input
            required
            className="bg-white text-black p-2 h-11"
            type="text"
            id="name"
            placeholder="Your Name.."
            name="name"
          />
        </div>
        <div className="form-group flex flex-col flex-nowrap gap-2">
          <label htmlFor="email" className="text-lg">
            Email
          </label>
          <input
            required
            className="bg-white text-black p-2 h-11"
            type="email"
            id="email"
            placeholder="Your Email.."
            name="email"
          />
        </div>
        <div className="form-group flex flex-col flex-nowrap gap-2">
          <label htmlFor="subject" className="text-lg">
            Subject
          </label>
          <input
            required
            className="bg-white text-black p-2 h-11"
            type="text"
            id="subject"
            placeholder="State Your Subject.."
            name="subject"
          />
        </div>
        <div className="form-group flex flex-col flex-nowrap gap-2">
          <label htmlFor="message" className="text-lg">
            Message
          </label>
          <textarea
            required
            placeholder="Message.."
            className="bg-white text-black p-2 h-75"
            name="message"
            id="message"
          ></textarea>
          <button
            disabled={submiting}
            className="button-primary h-12 text-xl w-37.5 mt-3 ml-auto"
            type="submit"
          >
            {submiting ? "Sending.." : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}

function LastestTracksSection() {
  const {
    isLoading,
    data: tracks,
    error,
  } = useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const res = await callApi<Track[]>({
        method: "get",
        endpoint: "/tracks",
        withAuth: false,
      });

      return res.data;
    },
  });

  return (
    <section
      id="lastest-tracks"
      className="lastest-tracks mt-14 mb-14 md:mt-20 bg-[rgba(110,172,218,0.05)] text-white p-5 lg:px-10"
    >
      <h2 className="text-left pl-4 md:pl-14">
        Latest Tracks From Siwel Beatz
      </h2>

      {error ? (
        <p className="p-5">Unable to load lastest tracks</p>
      ) : isLoading ? (
        <p className="p-5">Loading lastest tracks..</p>
      ) : tracks && tracks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 min-[599px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 mt-5 mb-5 md:mt-8 gap-4 place-items-center">
            {tracks.map((track) => (
              <TrackCard key={track._id} track={track} />
            ))}
          </div>
          <Button className="my-3 text-xl w-44" text="Browse more tracks" />
        </>
      ) : (
        "No tracks available."
      )}

      {/* <div className="grid grid-cols-1 min-[599px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 mt-5 mb-5 md:mt-8 gap-4 place-items-center">
        {isLoading
          ? "Loading Lastest Tracks.."
          : tracks && tracks.length > 0
            ? tracks.map((track) => <TrackCard key={track._id} track={track} />)
            : "No Tracks Available."}
      </div>
      <Button className="my-3 text-xl w-44" text="Browse more tracks" /> */}
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="mt-24 mb-10 lg:my-28">
      <h2 style={{ fontSize: "2.3rem" }} className="">
        About Siwel Draxx
      </h2>
      <div className="grid place-items-center grid-cols-1 min-[600px]:grid-cols-2 gap-6 py-7 p-5 lg:mx-28">
        <div className="place-self-start cover-image w-full overflow-hidden rounded-md">
          <img
            className="w-full h-full object-cover"
            src="/profile.png"
            alt="Siwel Draxx Profile"
          />
        </div>
        <div className="bio place-self-start text-left">
          <p style={{ marginBottom: "1rem" }}>
            Siwel Drax is an 18-year-old beat producer and mixing engineer based
            in the United States. While he’s mainly focused on drill, Siwel is
            versatile across all genres, bringing his unique style and
            professional touch to everything he works on.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            Known for his crisp mixes and hard-hitting beats, he’s already
            collaborated with rising artists like Demy Thekidd, pushing the
            boundaries of modern sound.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            Siwel’s goal is to help artists bring their vision to life, whether
            through custom beats or top-tier mixing that makes every track sound
            its best.
          </p>
        </div>
      </div>
    </section>
  );
}

function LicensesSection() {
  return (
    <section className="licences-terms my-24 lg:my-28">
      <h2 style={{ fontSize: "2.3rem" }} className="">
        Licensing Terms
      </h2>
      <div className=" flex flex-row flex-wrap gap-4 py-7 px-5 md:px-10 lg:px-24 items-center justify-center lg:justify-start">
        <div className="border border-white p-3 rounded-md w-full max-w-100 text-left h-64">
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
        <div className="border border-white p-3 rounded-md w-full max-w-100 text-left h-64">
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
  );
}

function ServicesSection() {
  return (
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
              I’ll craft high-quality, industry-standard beats tailored to your
              unique style. Whether you need hard-hitting trap, smooth R&B, or a
              unique blend, I’ve got you covered.
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
              I’ll craft high-quality, industry-standard beats tailored to your
              unique style. Whether you need hard-hitting trap, smooth R&B, or a
              unique blend, I’ve got you covered.
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
              I’ll craft high-quality, industry-standard beats tailored to your
              unique style. Whether you need hard-hitting trap, smooth R&B, or a
              unique blend, I’ve got you covered.
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
  );
}

/* Home page */
function Home() {
  return (
    <>
      <Header />
      <main className="">
        <h1>Siwel Beats App</h1>
        <div className="bg-white flex flex-row flex-nowrap items-center m-4 max-w-xl md:mx-auto">
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

        <LastestTracksSection />

        <LicensesSection />

        <ServicesSection />

        <AboutSection />

        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

export default Home;
