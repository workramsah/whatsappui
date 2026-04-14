import { Send, Bot, FileText, Users, PhoneCall, MonitorSmartphone } from "lucide-react";

const features = [
  {
    title: "Bulk\nMessaging",
    description: "Send campaigns, offers, and promotions from one workflow.",
    icon: Send,
  },
  {
    title: "AI ChatBot\nAutomation",
    description: "Reply instantly, qualify leads, and keep chats moving.",
    icon: Bot,
  },
  {
    title: "Message\nTemplates",
    description: "Reuse ready-made messages for offers, reminders, and support.",
    icon: FileText,
  },
  {
    title: "Contact\nManagement",
    description: "Tag, filter, and manage contacts with less manual work.",
    icon: Users,
  },
  {
    title: "Call\nAutomation",
    description: "Track calls and automate follow-up actions.",
    icon: PhoneCall,
  },
  {
    title: "Multi-Device\nSupport & Follow Up",
    description: "Work across devices and keep follow-ups running.",
    icon: MonitorSmartphone,
  }
];

export default function Box() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow duration-300"
          >
            <div className="w-12 h-12 bg-[#f0fdf4] rounded-xl flex items-center justify-center mb-8">
              <feature.icon className="w-6 h-6 text-[#1c9f43]" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-4 whitespace-pre-line leading-tight">
              {feature.title}
            </h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
