import { MessageSquare } from "lucide-react";
import Image from "next/image";

const sectionData = [
    {
        src: "/img/image1.png",
        alt: "Real time customer intent",
        title: "Capture customer  to drive sales",
    },
   
    {
        src: "/img/image2.png",
        alt: "Engage your audience",
        title: "Don't just chat, convertales",
    },
    {
        src: "/img/image3.png",
        alt: "Don't just chat, convert",
        title: "Engage your audience to drive sales",
    },
];

export default function Box3() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sectionData.map((section, index) => (
                    <div key={index} className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                {section.title}
                            </h3>
                        </div>
                        <div className="bg-[#1e4034] rounded-3xl  overflow-hidden shadow-lg w-full">
                            <div className="relative w-full h-64">
                                <Image
                                    src={section.src}
                                    alt={section.alt}
                                    layout="fill"
                                    objectFit="contain"
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
