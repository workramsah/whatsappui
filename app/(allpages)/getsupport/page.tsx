"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  MessageCircle, 
  Mail, 
  HelpCircle, 
  Send, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Headset
} from "lucide-react";
import { useState } from "react";

const supportChannels = [
  {
    title: "WhatsApp Support",
    description: "Get instant help from our support team via WhatsApp. Quickest way to resolve issues.",
    icon: MessageCircle,
    action: "Chat Now",
    href: "https://wa.me/15551234567", // Replace with actual support number
    color: "bg-green-50",
    iconColor: "text-[#0F7045]",
  },
  {
    title: "Email Support",
    description: "Send us an email and we'll get back to you within 24 hours with a detailed solution.",
    icon: Mail,
    action: "Send Email",
    href: "mailto:support@ifofy.com",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Help Center",
    description: "Browse our comprehensive guides and documentation to find answers to common questions.",
    icon: HelpCircle,
    action: "Visit Help Center",
    href: "/resource",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  }
];

const faqs = [
  {
    question: "How do I set up my WhatsApp automation?",
    answer: "You can start by connecting your WhatsApp Business account in the dashboard and then creating your first automation rule in the 'Automation' section."
  },
  {
    question: "What are the pricing plans available?",
    answer: "We offer several plans tailored to different business sizes, starting from a Basic plan for small shops to Enterprise solutions for large-scale operations."
  },
  {
    question: "Can I integrate with my existing CRM?",
    answer: "Yes, we provide API access and native integrations with popular CRMs like Salesforce, HubSpot, and more."
  }
];

export default function GetSupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    alert("Thank you for your message. We'll get back to you soon!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-[#242930] mb-6">
                How can we <span className="text-[#0F7045]">help you?</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                Whether you have a question about features, pricing, or need technical assistance, 
                our team is ready to support you every step of the way.
              </p>
            </motion.div>

            {/* Support Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {supportChannels.map((channel, index) => (
                <motion.a
                  key={channel.title}
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                  className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center group transition-all"
                >
                  <div className={`w-16 h-16 ${channel.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <channel.icon className={`w-8 h-8 ${channel.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-[#242930] mb-3">{channel.title}</h3>
                  <p className="text-gray-500 mb-6 flex-grow">{channel.description}</p>
                  <div className={`flex items-center gap-2 font-semibold ${channel.iconColor}`}>
                    {channel.action}
                    <ChevronRight size={16} />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & FAQ Section */}
        <section className="py-20 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Headset className="text-[#0F7045] w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#242930]">Send us a Message</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F7045]/20 focus:border-[#0F7045] transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F7045]/20 focus:border-[#0F7045] transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F7045]/20 focus:border-[#0F7045] transition-all"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F7045]/20 focus:border-[#0F7045] transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-[#0F7045] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3da545] transition-colors shadow-lg shadow-green-200"
                  >
                    <Send size={18} />
                    Send Message
                  </motion.button>
                </form>
              </motion.div>

              {/* FAQ Section */}
              <div className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold text-[#242930] mb-8">Frequently Asked <span className="text-[#0F7045]">Questions</span></h2>
                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                      >
                        <h4 className="text-lg font-bold text-[#242930] mb-2">{faq.question}</h4>
                        <p className="text-gray-500">{faq.answer}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[#242930] text-sm">Secure Support</h5>
                      <p className="text-xs text-gray-500">Encrypted communication</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="text-orange-600 w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[#242930] text-sm">24/7 Monitoring</h5>
                      <p className="text-xs text-gray-500">Always here for you</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        
      </main>

      <Footer />
    </div>
  );
}
