import { Link } from "react-router-dom";
import { Palette, ArrowLeft } from "lucide-react";

function WhyAndHow() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-lime-500 to-orange-600">
                <Palette className="text-white" size={24} />
              </div>
              <div>
                <h1 className="flex gap-2 text-2xl font-bold text-amber-500">
                  <Link to="/" className="hover:underline">
                    Paint By{" "}
                    <span className="text-[#39FF14] [-webkit-text-stroke:1px_#374151] [text-stroke:1px_#374151]">
                      {" "}
                      Neon
                    </span>
                  </Link>
                </h1>
                <p className="text-sm text-gray-600">Why and How?</p>
              </div>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ArrowLeft size={16} />
              Back to App
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="p-8 space-y-8 bg-white rounded-lg shadow-lg">
          {/* Why Section */}
          <section>
            <h2 className="flex items-center gap-2 mb-4 text-3xl font-bold text-gray-800">
              <span className="text-lime-600">Why</span> Paint By Neon?
            </h2>
            <div className="space-y-4 leading-relaxed text-gray-700">
              <img
                src="/public/images/koby.png"
                alt="Why Paint By Neon"
                className="w-full h-auto rounded-lg shadow-md md:w-1/2"
              />
              <p>
                Art is more than just a pretty picture; it's a powerful stress
                buster, a conduit for emotion, and a window to different
                perspectives. A single painting can evoke a unique set of
                feelings and insights in every observer.
              </p>
              <p>
                However, the journey to creating art can feel intimidating or
                inaccessible. We believe everyone deserves the joy of creation.
                We want to unlock the artist within you and make the process not
                just easy, but an inspiring path to mastery.
              </p>
              <p>
                Aspiring painters often struggle with two fundamental
                challenges: accurately drawing shapes and selecting appropriate
                colors. Our goal is to address and simplify these intimidating
                aspects of painting. Whether you're a beginner looking to
                develop your artistic skills or an experienced artist seeking a
                new creative outlet, our website provides the perfect platform.
              </p>
              <p>
                <b>That's why we created PaintByNeon.com.</b>
              </p>
              <p>
                The website democratizes art creation by making it accessible to
                everyone, regardless of their skill level. By converting any
                image into a paint-by-numbers canvas, we remove the intimidation
                factor and allow you to focus on the meditative process of
                coloring and creation.
              </p>
              <div className="p-6 border rounded-lg bg-gradient-to-r from-lime-50 to-orange-50 border-lime-200">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  Key Benefits:
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Develop artistic confidence through guided painting</li>
                  <li>Create beautiful artwork from your own photos</li>
                  <li>Enjoy a relaxing and therapeutic creative experience</li>
                  <li>Learn about color theory and composition naturally</li>
                  <li>Save and export your masterpieces anytime</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How Section */}
          <section>
            <h2 className="flex items-center gap-2 mb-4 text-3xl font-bold text-gray-800">
              <span className="text-orange-600">How</span> Does It Work?
            </h2>
            <div className="space-y-4 leading-relaxed text-gray-700">
              <p>
                Paint By Neon uses advanced image processing algorithms to
                transform your photos into paint-by-neon canvases. Here's how
                the magic happens:
              </p>

              <div className="grid gap-4 mt-6 md:grid-cols-2">
                <div className="p-5 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 font-bold text-white bg-blue-500 rounded-full">
                      1
                    </span>
                    <h3 className="text-lg font-semibold">Upload Your Image</h3>
                  </div>
                  <p className="text-sm">
                    Choose any photo you'd like to paint. Our website works best
                    with images that have clear subjects and good contrast.
                  </p>
                </div>

                <div className="p-5 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 font-bold text-white bg-purple-500 rounded-full">
                      2
                    </span>
                    <h3 className="text-lg font-semibold">
                      Automatic Processing
                    </h3>
                  </div>
                  <p className="text-sm">
                    The website analyzes your image, extracts dominant colors,
                    and creates a grayscale outline with edge detection to guide
                    your painting.
                  </p>
                </div>

                <div className="p-5 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 font-bold text-white bg-green-500 rounded-full">
                      3
                    </span>
                    <h3 className="text-lg font-semibold">
                      Start Painting with Neon
                    </h3>
                  </div>
                  <p className="text-sm">
                    Use the color palette generated from your image, or mix your
                    own colors. Click on a color, and poof! The areas on your
                    canvas where that color belongs magically glow in a vibrant
                    Neon hue, giving you the ultimate visual cheat sheet!
                  </p>
                </div>

                <div className="p-5 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 font-bold text-white bg-orange-500 rounded-full">
                      4
                    </span>
                    <h3 className="text-lg font-semibold">Save & Export</h3>
                  </div>
                  <p className="text-sm">
                    Save your progress at any time and come back later. When
                    finished, export your masterpiece as a high-quality image.
                  </p>
                </div>
              </div>

              <div className="p-6 mt-6 border rounded-lg bg-gradient-to-r from-amber-50 to-lime-50 border-amber-200">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  Pro Tips:
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-500">•</span>
                    <span>
                      Use the color highlight feature to see which areas of the
                      original image match your selected color
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-500">•</span>
                    <span>
                      Zoom in for detailed work and zoom out to see the overall
                      composition
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-500">•</span>
                    <span>
                      Lower brush opacity for subtle blending and layering
                      effects
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-500">•</span>
                    <span>
                      Use the eraser tool to refine edges and make corrections
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-500">•</span>
                    <span>Don't forget to save your progress regularly!</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="pt-8 text-center border-t border-gray-200">
            <h3 className="mb-4 text-2xl font-bold text-gray-800">
              Ready to Create Your Masterpiece?
            </h3>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-br from-lime-500 to-orange-600 hover:from-lime-600 hover:to-orange-700 hover:shadow-xl"
            >
              <Palette size={20} />
              Start Painting Now
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

export default WhyAndHow;
